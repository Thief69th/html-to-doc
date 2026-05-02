import HTMLtoDOCX from 'html-to-docx';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const body = await request.json();
    const { html, filename, options = {} } = body;

    if (!html) {
      return Response.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    // Sanitize filename
    const safeName = (filename || 'document')
      .replace(/\.(html|htm)$/i, '')
      .replace(/[^a-zA-Z0-9_\- ]/g, '_')
      .trim() || 'document';

    // Build a clean, complete HTML document
    let fullHtml = html.trim();
    if (!fullHtml.toLowerCase().includes('<html')) {
      fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.6; color: #000; }
h1 { font-size: 20pt; margin: 12pt 0 6pt; }
h2 { font-size: 16pt; margin: 10pt 0 5pt; }
h3 { font-size: 13pt; margin: 8pt 0 4pt; }
p  { margin: 0 0 6pt; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
td, th { border: 1px solid #999; padding: 5px 8px; }
th { background: #f0f0f0; font-weight: bold; }
ul, ol { margin: 4pt 0 4pt 20pt; }
li { margin: 2pt 0; }
img { max-width: 100%; }
code { font-family: Courier New, monospace; background: #f5f5f5; padding: 1px 3px; }
pre  { font-family: Courier New, monospace; background: #f5f5f5; padding: 8px; margin: 6pt 0; }
</style>
</head>
<body>${fullHtml}</body>
</html>`;
    }

    const docxOptions = {
      orientation: options.orientation || 'portrait',
      margins: {
        top: 1440,
        right: 1800,
        bottom: 1440,
        left: 1800,
      },
      title: safeName,
      subject: '',
      creator: 'html2doc',
      keywords: [],
      description: '',
      lastModifiedBy: 'html2doc',
      font: options.font || 'Calibri',
      fontSize: options.fontSize || 22,
      complexScriptsFont: options.font || 'Calibri',
      lineNumber: false,
      pageNumber: options.pageNumbers || false,
      footer: options.pageNumbers || false,
      header: false,
      table: { row: { cantSplit: true } },
      decodeUnicode: true,
    };

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, docxOptions);

    // Ensure we have a proper Node.js Buffer (not a Blob or ArrayBuffer)
    const nodeBuffer = Buffer.isBuffer(docxBuffer)
      ? docxBuffer
      : Buffer.from(
          docxBuffer instanceof ArrayBuffer
            ? docxBuffer
            : await docxBuffer.arrayBuffer()
        );

    // Use Uint8Array so Web Response API handles it correctly
    const uint8 = new Uint8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.byteLength);

    return new Response(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        'Content-Length': String(uint8.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return Response.json(
      { error: 'Conversion failed', details: error.message },
      { status: 500 }
    );
  }
}
