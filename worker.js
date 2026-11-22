export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      Response.json(data, {
        status,
        headers: {
          "Cache-Control": "no-store"
        }
      });

    try {
      if (url.pathname === "/api/health") {
        if (!env.DB) {
          return json({
            status: "Database not connected"
          }, 503);
        }

        await env.DB.prepare("SELECT 1").first();

        return json({
          shop: "Diamond Shop Kenya",
          status: "Online",
          database: "Connected"
        });
      }

      if (url.pathname === "/api/products") {
        if (request.method !== "GET") {
          return json({
            error: "Method not allowed"
          }, 405);
        }

        const { results } = await env.DB.prepare(
          `SELECT id, name, category, description,
           price, stock, image
           FROM products
           WHERE active = 1
           ORDER BY id DESC`
        ).all();

        return json(results);
      }

      
      if (url.pathname === "/api/admin/login") {
        if (request.method !== "POST") {
          return json({ error: "Method not allowed" }, 405);
        }

        if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) {
          return json({ error: "Admin login not configured" }, 503);
        }

        const body = await request.json().catch(() => ({}));
        const password = body.password;

        if (typeof password !== "string" || password.length > 1024) {
          return json({ error: "Invalid credentials" }, 401);
        }

        const bytes = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        const hash = Array.from(new Uint8Array(digest))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        const expected = env.ADMIN_PASSWORD_HASH.trim().toLowerCase();

        if (!/^[a-f0-9]{64}$/.test(expected)) {
          return json({ error: "Admin login not configured" }, 503);
        }

        let difference = 0;
        for (let i = 0; i < 64; i++) {
          difference |= hash.charCodeAt(i) ^ expected.charCodeAt(i);
        }

        if (difference !== 0) {
          return json({ error: "Invalid credentials" }, 401);
        }

        return json({ message: "Password verified" });
      }


      if (url.pathname.startsWith("/api/")) {
        return json({
          error: "Endpoint not found"
        }, 404);
      }

      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error(error.message);

      return json({
        error: "Server operation failed"
      }, 500);
    }
  }
};
