
import adapter from '@sveltejs/adapter-static';
const config = {
    kit: {
        adapter: adapter({
            // default options are shown. On some platforms
            // these options are set automatically — see below
			prerender: { default: true },
            pages: 'build',
            assets: 'build',
            fallback: "index.html",
			trailingSlash: 'always',
			ssr: false,
            precompress: false,
            strict: false
        }),
		paths: {base: '/bc2024'},
    }
};

export default config;
