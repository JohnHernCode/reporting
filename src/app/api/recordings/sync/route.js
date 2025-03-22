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
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";


const pipeline = util.promisify(stream.pipeline);
const execAsync = util.promisify(exec);

export async function POST(req) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
    throw new Error(
      "AWS credentials or bucket name is missing. Please check your .env file."
    );
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Check the most recent upload date from the database
    const latestRecording = await Recording.findOne({}, { uploadDate: 1 }).sort({ uploadDate: -1 });
    const validStartDate = latestRecording
      ? dayjs(latestRecording.uploadDate) // Use the latest upload date from the database
      : dayjs("20240708", "YYYYMMDD"); // Default start date if the collection is empty

    console.log(`Fetching records after: ${validStartDate.format("YYYY-MM-DD")}`);

    // AWS S3 Client
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
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

    // Create temp directory for processing
    const tempDir = path.join(process.cwd(), "temp");
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

          // Skip invalid recordings (not following the expected pattern)
          if (!key.includes("#QUEUE#") || !key.includes(",")) {
            return;
          }

          const parts = key.split("/");
          const topLevelDate = parts[0]; // Extract top-level folder as YYYYMMDD
          const uploadDate = dayjs(topLevelDate, "YYYYMMDD");

          // Skip recordings before the latest valid start date
          if (uploadDate.isBefore(validStartDate)) {
            console.log(`Skipping record before valid date: ${key}`);
            return;
          }

          // Extract agent's full name
          const agentFullName = parts[1]?.replace(",", "").toLowerCase();
          if (!agentFullName) {
            console.log(`Invalid agent name in key: ${key}`);
            return;
          }
          const [lastName, firstName] = agentFullName.split(" ");
          const agent = `${firstName} ${lastName}`;

          // Extract DNIS using the regex
          const dnisMatch = key.match(/#QUEUE#_[^_]+_([^_]+)(_Done|__)/);
          const dnis = dnisMatch ? dnisMatch[1] : null;
          if (!dnis) {
            console.log(`Unable to extract DNIS from key: ${key}`);
            return;
          }

          // Find the account by matching either DNIS or testingNumber
          const accountRecord = await Account.findOne({
            $or: [{ dnis }, { testingNumber: dnis }],
          });

          const accountName = accountRecord ? accountRecord.accountName : "Unknown";
          const callTime = dayjs(obj.LastModified).subtract(5, "minute").format("h:mm A");
          const formattedUploadDate = uploadDate.format("MM/DD/YY");

          // Download the file and extract the duration
          const tempFilePath = path.join(tempDir, `tmp_${path.basename(key)}`);
          const getObjectCommand = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
          });
          const s3Response = await s3Client.send(getObjectCommand);
          const fileStream = fs.createWriteStream(tempFilePath);
          await pipeline(s3Response.Body, fileStream);

          // Extract duration using ffmpeg
          console.log(`Extracting duration for: ${tempFilePath}`);
          const { stdout } = await execAsync(
            `ffmpeg -i "${tempFilePath}" 2>&1 | grep "Duration"`
          );
          const durationMatch = stdout.match(/Duration: (\d+:\d+:\d+)/);
          const duration = durationMatch ? durationMatch[1] : null;

          // Delete the temporary file
          fs.unlinkSync(tempFilePath);

          // Add the recording with duration to the list
          recordings.push({
            agent,
            dnis,
            account: accountName,
            callTime,
            uploadDate: formattedUploadDate,
            objectKey: key,
            testingNumber: accountRecord?.testingNumber || null,
            duration, // Save the duration
          });
        } catch (error) {
          console.error(`Error processing file: ${obj.Key}`, error);
        }
      });

      // Wait for all file processing tasks in this batch
      await Promise.all(fileProcessingTasks);
    } while (continuationToken);

    // Save to the database in bulk
    const savedRecordings = await Recording.insertMany(recordings);

    // Clean up temp directory
    fs.rmdirSync(tempDir, { recursive: true });

    console.log(`Successfully synced ${savedRecordings.length} recordings.`);
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
