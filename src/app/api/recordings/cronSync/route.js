import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { connectToDatabase } from "@/app/lib/mongodb";
import Recording from "@/app/models/Recording";
import Account from "@/app/models/Account";
import dayjs from "dayjs";
import util from "util";
import { exec } from "child_process";
import stream from "stream";
import path from "path";
import fs from "fs";

const pipeline = util.promisify(stream.pipeline);
const execAsync = util.promisify(exec);

export async function POST(req) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
    return new Response(
      JSON.stringify({ error: "Missing AWS credentials or bucket name in .env" }),
      { status: 500 }
    );
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch the most recent upload date and time
    const latestRecording = await Recording.findOne({}, { uploadDate: 1 })
      .sort({ uploadDate: -1 })
      .lean();
    const validStartDate = latestRecording
      ? dayjs(latestRecording.uploadDate) // Use the latest upload date and time
      : dayjs("20250116T000000", "YYYYMMDDTHHmmss"); // Default start date if no records exist

    console.log(`Fetching records after: ${validStartDate.toISOString()}`);

    // Initialize AWS S3 client
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000, // Timeout in milliseconds
        socketTimeout: 300000, // Adjust socket timeout as needed
        maxSockets: 200, // Increase max sockets to a higher value (default is 50)
      }),
    });

    const params = {
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 1000,
    };

    let continuationToken;
    const recordings = [];
    const tempDir = path.join(process.cwd(), "temp");

    // Create temp directory for file processing if it doesn't exist
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    do {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(params);
      const result = await s3Client.send(command);
      continuationToken = result.NextContinuationToken;

      const fileProcessingTasks = result.Contents.map(async (obj) => {
        try {
          const key = obj.Key;

          // Validate key structure
          if (!key.includes("#QUEUE#") || !key.includes(",")) {
            return;
          }

          const parts = key.split("/");
          const topLevelDate = parts[0]; // Extract YYYYMMDD
          const uploadDate = dayjs(topLevelDate, "YYYYMMDD");

          // Skip files with earlier upload dates
          if (uploadDate.isBefore(validStartDate)) {
            console.log(`Skipping file before valid date: ${key}`);
            return;
          }

          // Extract agent and other details
          const agentFullName = parts[1]?.replace(",", "").toLowerCase();
          if (!agentFullName) return;
          const [lastName, firstName] = agentFullName.split(" ");
          const agent = `${firstName} ${lastName}`;

          const dnisMatch = key.match(/#QUEUE#_[^_]+_([^_]+)(_Done|__)/);
          const dnis = dnisMatch ? dnisMatch[1] : null;
          if (!dnis) return;

          const accountRecord = await Account.findOne({
            $or: [{ dnis }, { testingNumber: dnis }],
          });

          const accountName = accountRecord ? accountRecord.accountName : "Unknown";
          const callTime = dayjs(obj.LastModified).subtract(5, "minute").format("h:mm A");
          const formattedUploadDate = uploadDate.format("MM/DD/YY");

          // Temporary file for download
          const tempFilePath = path.join(tempDir, `tmp_${path.basename(key)}`);
          const getObjectCommand = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
          const s3Response = await s3Client.send(getObjectCommand);
          const fileStream = fs.createWriteStream(tempFilePath);
          await pipeline(s3Response.Body, fileStream);

          // Extract duration using ffmpeg
          const { stdout } = await execAsync(`ffmpeg -i "${tempFilePath}" 2>&1 | grep "Duration"`);
          const durationMatch = stdout.match(/Duration: (\d+:\d+:\d+)/);
          const duration = durationMatch ? durationMatch[1] : null;

          console.log(`Duration for file ${key}: ${duration}`);

          // Clean up the temporary file
          fs.unlinkSync(tempFilePath);

          recordings.push({
            agent,
            dnis,
            account: accountName,
            callTime,
            uploadDate: formattedUploadDate,
            objectKey: key,
            testingNumber: accountRecord?.testingNumber || null,
            duration,
          });
        } catch (error) {
          console.error(`Error processing file ${obj.Key}:`, error);
        }
      });

      await Promise.all(fileProcessingTasks);
    } while (continuationToken);

    // Bulk insert into MongoDB
    const savedRecordings = await Recording.insertMany(recordings);

    console.log(`Successfully synced ${savedRecordings.length} recordings.`);

    // Remove temporary directory
    fs.rmdirSync(tempDir, { recursive: true });

    return new Response(
      JSON.stringify({
        message: "Recordings synced successfully",
        newRecordings: savedRecordings.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing recordings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync recordings" }),
      { status: 500 }
    );
  }
}
