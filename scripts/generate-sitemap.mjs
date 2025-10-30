import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const rawSiteUrl = (process.env.SITE_URL || '').trim();

if (!rawSiteUrl) {
  console.warn(
    'Skipping sitemap generation because SITE_URL is not set. Provide SITE_URL to generate an absolute sitemap.'
  );
  process.exit(0);
}

const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const routes = ['/'];
const lastMod = new Date().toISOString();

const urlEntries = routes
  .map((route, index) => {
    const priority = index === 0 ? '1.0' : '0.5';
    return `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

const outputPath = resolve('public', 'sitemap.xml');

await writeFile(outputPath, xml, 'utf8');
console.log(`sitemap.xml generated at ${outputPath} for ${siteUrl}`);
