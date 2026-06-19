import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    // Simply read the request body (the uploaded file buffer)
    const _buffer = await request.arrayBuffer();
    
    // We just return success as it's a simulated storage upload.
    // In local development, the metadata will be saved in Supabase pointing to a mock PDF.
    return NextResponse.json({ 
      success: true, 
      message: 'Simulated file upload successful. Pointed database to mock PDF. Please configure Cloudflare R2 variables in .env.local to enable real storage.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support POST just in case the client uses it instead of PUT
export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Simulated file upload successful. Pointed database to mock PDF. Please configure Cloudflare R2 variables in .env.local to enable real storage.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
