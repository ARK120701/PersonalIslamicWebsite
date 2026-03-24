/**
 * ============================================================
 * CLOUDFLARE WORKER — Islamic Library Upload API
 * ============================================================
 * Deploy this at: Workers & Pages → Create Worker → paste this
 *
 * BINDINGS TO ADD IN WORKER SETTINGS:
 *   R2 Bucket binding:  Variable name = MY_BUCKET  → your bucket
 *   Environment variable: ADMIN_SECRET = your secret password
 *
 * ROUTES:
 *   PUT  /upload/:filename  → upload a PDF to R2
 *   DELETE /delete/:key     → delete a PDF from R2
 *   GET  /health            → check worker is alive
 * ============================================================
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
};

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check (no auth needed)
    if (path === '/health') {
      return json({ status: 'ok', bucket: env.MY_BUCKET ? 'connected' : 'missing' });
    }

    // All other routes require admin key
    const adminKey = request.headers.get('X-Admin-Key');
    if (adminKey !== env.ADMIN_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // PUT /upload/:filename — upload a PDF
    if (request.method === 'PUT' && path.startsWith('/upload/')) {
      try {
        const filename = decodeURIComponent(path.replace('/upload/', ''));
        const key = `books/${Date.now()}-${filename}`;
        const body = await request.arrayBuffer();

        if (!body.byteLength) return json({ error: 'Empty file' }, 400);

        await env.MY_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: 'application/pdf',
            contentDisposition: `inline; filename="${filename}"`,
          },
        });

        // Build the public URL (your R2 public bucket URL)
        const publicUrl = `${env.PUBLIC_BUCKET_URL}/${key}`;

        return json({ success: true, key, url: publicUrl });

      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // DELETE /delete/:key — remove a PDF
    if (request.method === 'DELETE' && path.startsWith('/delete/')) {
      try {
        const key = decodeURIComponent(path.replace('/delete/', ''));
        await env.MY_BUCKET.delete(key);
        return json({ success: true, deleted: key });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
