import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { filename, contentType, companyId, certificateId } = await request.json();

    if (!filename || !companyId || !certificateId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const r2Endpoint = process.env.R2_ENDPOINT;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET_NAME;

    // Check if Cloudflare R2 is configured. If not, use local mock upload route.
    if (!r2Endpoint || !r2AccessKey || !r2SecretKey || !r2Bucket) {
      console.warn('R2 is not fully configured in env variables. Using mock upload fallback.');
      
      // Simulate unique key for database entry
      const fileKey = `${companyId}/${certificateId}/${Date.now()}-${filename}`;
      // Fallback url that just returns a placeholder PDF
      const mockFileUrl = `/mock-certificate.pdf`;

      return NextResponse.json({
        uploadUrl: `/api/mock-upload?key=${encodeURIComponent(fileKey)}`,
        fileUrl: mockFileUrl,
        isMock: true,
      });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

    const fileKey = `${companyId}/${certificateId}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: r2Bucket,
      Key: fileKey,
      ContentType: contentType || 'application/pdf',
    });

    // URL expires in 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Public URL if configured, otherwise fallback to presigned GET or direct R2 download path if bucket is public
    const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || `${r2Endpoint}/${r2Bucket}`;
    const fileUrl = `${publicBaseUrl}/${fileKey}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      fileKey,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Error generating presigned upload URL:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
