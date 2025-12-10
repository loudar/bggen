// @ts-ignore
const baseDir = import.meta.dir;

function file(path: string) {
    return Bun.file(path);
}

function notFound() {
    return new Response("Not found", {status: 404});
}

Bun.serve({
    port: Number(process.env.PORT || 3001),
    fetch(req: Request) {
        const url = new URL(req.url);

        // Root path: serve index.html directly to avoid attempting to read /ui directory
        if (url.pathname === "/" || url.pathname === "") {
            const indexFile = file(`${baseDir}/../ui/index.html`);
            return new Response(indexFile, {
                headers: {"Content-Type": "text/html; charset=utf-8"}
            });
        }

        // Serve built assets from /out
        if (url.pathname.startsWith("/out/")) {
            const f = file(`${baseDir}/../out/${url.pathname.substring(5)}`);
            if ((f as any).size) return new Response(f);
            return notFound();
        }

        // Serve UI static assets (css, images) from /ui or root-relative
        if (url.pathname.startsWith("/ui/")) {
            const subPath = url.pathname.substring(4);
            // Avoid attempting to read a directory like a file (e.g., "/ui/")
            if (subPath.length === 0 || subPath.endsWith("/")) {
                return notFound();
            }
            const f = file(`${baseDir}/../ui/${subPath}`);
            if ((f as any).size) return new Response(f);
            return notFound();
        }
        // Root-relative static files like /styles.css (only try when path looks like a file)
        if (/[.][A-Za-z0-9]+$/.test(url.pathname)) {
            const rootStatic = file(`${baseDir}/../ui${url.pathname}`);
            if ((rootStatic as any).size) {
                return new Response(rootStatic);
            }
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
