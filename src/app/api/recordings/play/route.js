import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { pipeline } from "stream";
import util from "util";
import { exec } from "child_process";
import { connectToDatabase } from "@/app/lib/mongodb";
import Recording from "@/app/models/Recording";

const pump = util.promisify(pipeline);
const execAsync = util.promisify(exec);

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const objectKey = url.searchParams.get("key");
    const recordingId = url.searchParams.get("_id");

    console.log("Record ID:", recordingId);
    console.log("Object Key:", objectKey);

    if (!objectKey || !recordingId) {
      return new Response(
        JSON.stringify({ error: "Missing object key or recording ID" }),
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Ensure the public folder exists
    const publicPath = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath);
    }

    // 🔥 Use a UNIQUE filename based on `recordingId`
    const sanitizedId = recordingId.replace(/[^a-zA-Z0-9]/g, "");
    const tempFilePath = path.join(publicPath, `${sanitizedId}.WAV`);
    const convertedFilePath = path.join(publicPath, `${sanitizedId}.mp3`);

    // ✅ Check if the file already exists (avoid re-downloading)
    if (!fs.existsSync(convertedFilePath)) {
      // Delete any existing WAV file before downloading a new one
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      // Download the file from S3
      console.log("Downloading file to:", tempFilePath);
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
      });
      const s3Response = await s3Client.send(command);
      await pump(s3Response.Body, fs.createWriteStream(tempFilePath));

      // Convert the WAV file to MP3 using ffmpeg
      console.log("Converting file to MP3:", convertedFilePath);
      try {
        await execAsync(`ffmpeg -i "${tempFilePath}" -q:a 0 -map a "${convertedFilePath}"`);
      } catch (error) {
        console.error("ffmpeg error:", error.message);
        throw new Error("ffmpeg conversion failed");
      }

      // Extract the duration of the MP3 file
      const { stdout } = await execAsync(
        `ffmpeg -i "${convertedFilePath}" 2>&1 | grep "Duration"`
      );
      const durationMatch = stdout.match(/Duration: (\d+:\d+:\d+)/);
      const duration = durationMatch ? durationMatch[1] : null;

      console.log("Extracted Duration:", duration);

      // ✅ Update the recording's duration in the database
      if (duration) {
        await Recording.findByIdAndUpdate(recordingId, { duration });
        console.log(`Updated recording ${recordingId} with duration: ${duration}`);
      }

      // ✅ Delete the original WAV file after conversion
      fs.unlinkSync(tempFilePath);
    }

    return new Response(
      JSON.stringify({ fileUrl: `/${sanitizedId}.mp3` }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error handling file:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process file" }),
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove Audio File After Playback
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("key"); // Get the file name directly

    if (!fileName) {
      return new Response(JSON.stringify({ error: "Missing file name" }), { status: 400 });
    }

    // Construct the full file path in the public directory
    const filePath = path.join(process.cwd(), "public", fileName);
    console.log("Deleting file at path:", filePath);

    // Check if the file exists before deleting
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
      console.log("File deleted successfully:", filePath);
    } else {
      console.log("File not found:", filePath);
    }

    return new Response(JSON.stringify({ message: "File deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting file:", error);
    return new Response(JSON.stringify({ error: "Failed to delete file" }), { status: 500 });
  }
}
