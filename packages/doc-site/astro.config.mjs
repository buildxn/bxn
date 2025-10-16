// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://buildxn.github.io',
	base: '/wapix',
	integrations: [
		starlight({
			title: 'wapix',
			logo: {
				src: './src/assets/logo.svg',
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/buildxn/wapix' }
			],
			editLink: {
				baseUrl: 'https://github.com/buildxn/wapix/edit/main/packages/doc-site/',
			},
			components: {
				Footer: './src/components/Footer.astro',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'File-System Routing', slug: 'core/file-system-routing' },
						{ label: 'Request Handlers', slug: 'core/request-handlers' },
						{ label: 'Type Safety', slug: 'core/type-safety' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Response Helpers', slug: 'reference/response-helpers' },
						{ label: 'CLI Commands', slug: 'reference/cli' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'REST API', slug: 'examples/rest-api' },
						{ label: 'Streaming', slug: 'examples/streaming' },
					],
				},
			],
		}),
		
	],
});
