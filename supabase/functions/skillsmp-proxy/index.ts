// No external imports to ensure no dependency resolution issues
const SKILLSMP_API_URL = "https://skillsmp.com/api/v1";

console.log("Function loaded");

Deno.serve(async (req) => {
  console.log("Received request:", req.method, req.url);

  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-skillsmp-key",
      },
    });
  }

  try {
    const url = new URL(req.url);
    // Replace the function path to get the relative API path
    // Matches /functions/v1/skillsmp-proxy
    const path = url.pathname.replace(/\/functions\/v1\/skillsmp-proxy/, "");
    
    // Construct target URL
    const targetUrl = new URL(`${SKILLSMP_API_URL}${path}`);
    url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    // Headers Construction
    const headers = new Headers();
    
    // 1. Authentication
    const customKey = req.headers.get("x-skillsmp-key");
    if (customKey) {
        headers.set("Authorization", `Bearer ${customKey.replace('Bearer ', '')}`);
    }
    
    // 2. Browser Masquerading
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json, text/plain, */*");
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    headers.set("Referer", "https://skillsmp.com/"); 
    headers.set("Origin", "https://skillsmp.com");


    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined,
    });

    // Return response with headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("X-Function-Executed", "true"); 

    return new Response(await response.blob(), {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*"
      },
    });
  }
});
