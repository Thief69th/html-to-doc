import { NextResponse } from 'next/server';
import HTMLtoDOCX from 'html-to-docx';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const body = await request.json();
    const { html, filename, options = {} } = body;

    if (!html) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    // Ensure it's a full HTML document
    let fullHtml = html;
    if (!fullHtml.toLowerCase().includes('<html')) {
      fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; }
    h1 { font-size: 20pt; } h2 { font-size: 16pt; } h3 { font-size: 13pt; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 6px 10px; }
    th { background: #f0f0f0; font-weight: bold; }
    img { max-width: 100%; }
    code, pre { font-family: Consolas, monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>${fullHtml}</body>
</html>`;
    }

    const docxOptions = {
      orientation: options.orientation || 'portrait',
      margins: options.margins || {
        top: 1440,
        right: 1800,
        bottom: 1440,
        left: 1800,
      },
      title: filename?.replace(/\.(html|htm)$/i, '') || 'Document',
      font: options.font || 'Calibri',
      fontSize: options.fontSize || 22,
      lineNumber: false,
      table: { row: { cantSplit: true } },
      pageNumber: options.pageNumbers || false,
      footer: options.pageNumbers || false,
      header: false,
      decodeUnicode: true,
    };

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, docxOptions);

    const outputName = filename
      ? filename.replace(/\.(html|htm)$/i, '.docx')
      : 'document.docx';

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed', details: error.message },
      { status: 500 }
    );
  }
}
