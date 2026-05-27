import { type NextRequest } from 'next/server';

/**
 * Image proxy: GET /api/img?s=<base64_encoded_url>
 *
 * Fetches images from approved MangaDex CDN domains and re-serves them
 * with long-lived cache headers. The route is cached at the edge via
 * `next: { revalidate }` plus the response Cache-Control header.
 */

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest) {
  const encoded = request.nextUrl.searchParams.get('s');

  if (!encoded) {
    return new Response('Missing parameter', { status: 400 });
  }

  let url: string;
  try {
    url = Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return new Response('Invalid parameter', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new Response('Invalid resource', { status: 400 });
  }

  const isAllowed =
    parsedUrl.hostname.endsWith('.mangadex.network') ||
    parsedUrl.hostname.endsWith('.mangadex.org') ||
    parsedUrl.hostname === 'uploads.mangadex.org';

  if (!isAllowed) {
    return new Response('Not allowed', { status: 403 });
  }

  try {
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'TappytoonWebsite/1.0',
        'Referer': 'https://mangadex.org/',
      },
      // Cache upstream image responses for a day at the data-cache layer
      next: { revalidate: ONE_WEEK },
    });

    if (!imageResponse.ok) {
      return new Response(`Upstream error: ${imageResponse.status}`, {
        status: imageResponse.status,
      });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new Response(imageResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${ONE_WEEK}, s-maxage=${ONE_WEEK}, stale-while-revalidate=86400, immutable`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Image fetch error:', error);
    return new Response('Failed to load image', { status: 502 });
  }
}
