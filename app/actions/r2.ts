"use server";

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.NEXT_PUBLIC_R2_BUCKET_NAME!;
const R2_ENDPOINT = process.env.R2_ENDPOINT!;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.ms-powerpoint", // ppt
  "image/jpeg",
  "image/png",
  "image/jpg",
  "video/mp4",
];

export async function getPresignedUploadUrl(
  folder: string,
  fileName: string,
  fileType: string
) {
  try {
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new Error("Tipe file tidak diizinkan. Hanya menerima PDF, Word, PowerPoint, Gambar, atau Video MP4.");
    }

    const fileKey = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`;

    return { presignedUrl, publicUrl, fileKey };
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
}

export async function deleteFileFromR2(fileKey: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting file from R2:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
