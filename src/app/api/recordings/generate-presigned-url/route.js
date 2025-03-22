import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connectToDatabase } from "@/app/lib/mongodb";
import Recording from "@/app/models/Recording";

// Explicitly mark this route as dynamic
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
    return new Response(
      JSON.stringify({ error: "Missing AWS credentials or bucket name in .env" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse the recording ID from the query
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Recording ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database and fetch the recording
    await connectToDatabase();
    const recording = await Recording.findById(id);

    if (!recording || !recording.objectKey) {
      return new Response(
        JSON.stringify({ error: "Recording not found or missing objectKey" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    // Generate a pre-signed URL using the objectKey
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: recording.objectKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated Pre-Signed URL:", presignedUrl);

    return new Response(
      JSON.stringify({ presignedUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate pre-signed URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
