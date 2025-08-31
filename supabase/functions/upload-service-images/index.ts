import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageUpload {
  base64: string;
  filename: string;
  mimeType: string;
}

interface UploadRequest {
  serviceRequestId: string;
  images: ImageUpload[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceRequestId, images }: UploadRequest = await req.json();

    if (!serviceRequestId || !images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing serviceRequestId or images' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload images to Google Drive and store references
    const uploadedImages = [];

    for (const image of images) {
      try {
        // Convert base64 to blob
        const base64Data = image.base64.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Upload to Google Drive
        const driveResponse = await uploadToGoogleDrive(
          binaryData,
          image.filename,
          image.mimeType
        );

        if (driveResponse.success) {
          // Store image reference in database
          const { data, error } = await supabase
            .from('service_images')
            .insert({
              service_request_id: serviceRequestId,
              image_url: driveResponse.webViewLink,
              google_drive_id: driveResponse.id,
              description: `${image.filename} uploaded via service request`,
            })
            .select()
            .single();

          if (error) {
            console.error('Database error:', error);
          } else {
            uploadedImages.push(data);
          }
        } else {
          console.error('Google Drive upload failed:', driveResponse.error);
        }
      } catch (error) {
        console.error('Error processing image:', image.filename, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        uploadedImages,
        message: `Successfully uploaded ${uploadedImages.length} out of ${images.length} images`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in upload-service-images function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function uploadToGoogleDrive(
  fileData: Uint8Array,
  filename: string,
  mimeType: string
): Promise<{ success: boolean; id?: string; webViewLink?: string; error?: string }> {
  try {
    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY');
    
    if (!apiKey) {
      return { success: false, error: 'Google Drive API key not configured' };
    }

    // Create metadata
    const metadata = {
      name: `service_${Date.now()}_${filename}`,
      parents: ['1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'], // Replace with your folder ID
    };

    // Create form data for multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    let body = delimiter;
    body += 'Content-Type: application/json\r\n\r\n';
    body += JSON.stringify(metadata) + delimiter;
    body += `Content-Type: ${mimeType}\r\n\r\n`;

    const bodyBytes = new TextEncoder().encode(body);
    const closeBytes = new TextEncoder().encode(close_delim);
    
    // Combine all parts
    const fullBody = new Uint8Array(bodyBytes.length + fileData.length + closeBytes.length);
    fullBody.set(bodyBytes, 0);
    fullBody.set(fileData, bodyBytes.length);
    fullBody.set(closeBytes, bodyBytes.length + fileData.length);

    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: fullBody,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Upload failed: ${errorText}` };
    }

    const result = await response.json();
    
    // Make file publicly accessible
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${result.id}/permissions?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }
    );

    return {
      success: true,
      id: result.id,
      webViewLink: `https://drive.google.com/file/d/${result.id}/view`,
    };

  } catch (error: any) {
    console.error('Google Drive upload error:', error);
    return { success: false, error: error.message };
  }
}