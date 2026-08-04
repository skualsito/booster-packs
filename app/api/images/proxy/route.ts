const allowedImageHosts = new Set(["www.onepiece-cardgame.com"]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const rawTarget = requestUrl.searchParams.get("url");

  if (!rawTarget) {
    return Response.json({ error: "Missing image URL." }, { status: 400 });
  }

  let target: URL;

  try {
    target = new URL(rawTarget);
  } catch {
    return Response.json({ error: "Invalid image URL." }, { status: 400 });
  }

  if (target.protocol !== "https:" || !allowedImageHosts.has(target.hostname)) {
    return Response.json({ error: "Image host not allowed." }, { status: 400 });
  }

  const response = await fetch(target.toString(), {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
      Referer: "https://www.onepiece-cardgame.com/cardlist/",
      "User-Agent": "Pullario local prototype",
    },
  });

  const contentType = response.headers.get("content-type") ?? "image/png";

  if (!response.ok || !contentType.startsWith("image/")) {
    return Response.json(
      { error: "Could not load image." },
      { status: response.ok ? 502 : response.status },
    );
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": contentType,
    },
  });
}
