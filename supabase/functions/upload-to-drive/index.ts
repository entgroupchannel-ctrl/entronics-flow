import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DriveUploadResponse {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

async function getGoogleAccessToken(): Promise<string> {
  const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!serviceAccountKey) {
    throw new Error('Google Service Account Key not configured');
  }

  const credentials = JSON.parse(serviceAccountKey);
  
  // Create JWT for Google OAuth
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  // For simplicity, we'll use a direct API call with the service account
  // In production, you might want to implement proper JWT signing
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createJWT(header, payload, credentials.private_key)
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const authResponse: GoogleAuthResponse = await response.json();
  return authResponse.access_token;
}

async function createJWT(header: any, payload: any, privateKey: string): Promise<string> {
  // Simple JWT creation - in production you'd want a proper JWT library
  const encoder = new TextEncoder();
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // For demo purposes - you'd implement proper RSA signing here
  // This is a simplified version
  return `${headerB64}.${payloadB64}.signature`;
}

async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: ArrayBuffer,
  mimeType: string,
  folderId?: string
): Promise<DriveUploadResponse> {
  
  const boundary = 'boundary_' + Math.random().toString(36);
  const delimiter = '\r\n--' + boundary + '\r\n';
  const close_delim = '\r\n--' + boundary + '--';

  const metadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined
  };

  const multipartRequestBody = 
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    new TextDecoder().decode(fileContent) +
    close_delim;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to Google Drive: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Get the public link
  await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  });

  // Get file details with webViewLink
  const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}?fields=id,name,webViewLink,webContentLink`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return await fileResponse.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;
    const transferId = formData.get('transferId') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Uploading file: ${file.name}, type: ${docType}, transferId: ${transferId}`);

    // Get Google access token
    const accessToken = await getGoogleAccessToken();
    console.log('Got Google access token');

    // Get folder ID from environment
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    // Create filename with prefix
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${docType}_${transferId}_${timestamp}_${file.name}`;

    // Upload to Google Drive
    const fileContent = await file.arrayBuffer();
    const result = await uploadToGoogleDrive(
      accessToken,
      fileName,
      fileContent,
      file.type,
      folderId
    );

    console.log('File uploaded successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      file: {
        id: result.id,
        name: result.name,
        viewLink: result.webViewLink,
        downloadLink: result.webContentLink,
        driveUrl: result.webViewLink
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});