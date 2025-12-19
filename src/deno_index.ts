// main.ts 或 server.ts
Deno.serve(async (request) => {
  const url = new URL(request.url);
  
  // 1. 定义目标：将请求转发给 Google 的官方 API 地址
  const targetUrl = new URL("https://generativelanguage.googleapis.com" + url.pathname + url.search);
  
  console.log(`[Proxy] Forwarding request to: ${targetUrl.toString()}`);

  // 2. 处理请求头：克隆原始请求头，但移除 host 以免被 Google 拒绝
  const newHeaders = new Headers(request.headers);
  newHeaders.delete("host");
  newHeaders.delete("x-forwarded-for");

  // 3. 发起转发请求
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body, // 直接透传请求体
    });

    // 4. 返回 Google 的响应给客户端
    // 创建一个新的响应对象，确保 CORS 头正确
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*"); // 允许跨域

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (err) {
    console.error("Proxy Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
