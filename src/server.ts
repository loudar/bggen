const baseDir = import.meta.dir;

function file(path: string) {
    return Bun.file(path);
}

function notFound() {
    return new Response("Not found", {status: 404});
}

function serveStatic(req: Request, dir: string) {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/+/, "");
    const fullPath = `${baseDir}/${dir}/${pathname.substring(dir.length + 1)}`;
    const f = file(fullPath);
    if ((f as any).size) {
        return new Response(f);
    }
    return notFound();
}

Bun.serve({
    port: Number(process.env.PORT || 3001),
    fetch(req: Request) {
        const url = new URL(req.url);

        // Serve built assets from /out
        if (url.pathname.startsWith("/out/")) {
            const f = file(`${baseDir}/../out/${url.pathname.substring(5)}`);
            if ((f as any).size) return new Response(f);
            return notFound();
        }

        // Serve UI static assets (css, images) from /ui or root-relative
        if (url.pathname.startsWith("/ui/")) {
            const f = file(`${baseDir}/../ui/${url.pathname.substring(4)}`);
            if ((f as any).size) return new Response(f);
            return notFound();
        }
        // Root-relative static files like /styles.css
        const rootStatic = file(`${baseDir}/../ui${url.pathname}`);
        if ((rootStatic as any).size) {
            return new Response(rootStatic);
        }

        // Root and any other path: serve index.html
        const indexFile = file(`${baseDir}/../ui/index.html`);
        return new Response(indexFile, {
            headers: {"Content-Type": "text/html; charset=utf-8"}
        });
    },
    error(error) {
        return new Response(String(error?.stack || error), {status: 500});
    }
});

console.log(`Server running on http://localhost:${process.env.PORT || 3001}/`);
