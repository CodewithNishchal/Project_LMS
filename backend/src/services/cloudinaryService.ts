import crypto from 'crypto';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  isCloudinary: boolean;
}

export const uploadPdfToCloudinary = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloudinary_cloud_name') {
    throw new Error('Cloudinary API credentials are missing or unconfigured in backend .env file.');
  }

  try {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    let mimeType = 'application/pdf';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

    const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'creditsea_slips';
    
    // Generate Cloudinary SHA1 Signature
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const payload = {
      file: base64Data,
      api_key: apiKey,
      timestamp: timestamp,
      folder: folder,
      signature: signature,
    };

    const fetchFn = (globalThis as any).fetch || require('node-fetch');
    const response = await fetchFn(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Cloudinary API returned error HTTP ${response.status}`);
    }

    return {
      url: data.secure_url || data.url,
      publicId: data.public_id || `cloud_${Date.now()}`,
      isCloudinary: true,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload document to Cloudinary storage.');
  }
};
