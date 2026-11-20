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
