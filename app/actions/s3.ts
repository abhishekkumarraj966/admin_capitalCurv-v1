'use server';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    endpoint: process.env.DO_END_POINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: false,
});

const BUCKET = process.env.DO_SPACE || '';

export async function getSignedUrlAction(urlOrKey: string) {
    if (!urlOrKey) return '';

    // Extract key if full URL is provided
    let key = urlOrKey;
    if (urlOrKey.startsWith('http')) {
        try {
            const urlObj = new URL(urlOrKey);
            key = urlObj.pathname.replace(/^\//, ''); // Remove leading slash
        } catch (e) {
            console.error('Invalid URL in getSignedUrlAction:', urlOrKey);
            return urlOrKey; // Return original if likely invalid
        }
    }

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET,
            Key: key,
        });

        // Generate signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    } catch (error) {
        console.error('Error signing URL:', error);
        return urlOrKey; // Fallback to original
    }
}
