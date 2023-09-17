
if (Bun.argv[2] === 'serve') {
    Bun.serve({
        fetch(req) {
            const url = new URL(req.url);
            if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html"))
                return new Response(Bun.file(import.meta.dir + "/build/index.html"));
            
            // all other routes
            return new Response("Hello!");
        }
    });
} else if (Bun.argv[2] === 'build') {
    const build = await Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './build'
    });
}
