import legacy from '../data/posts.json';
import { expandFramework } from './framework.js';

// New articles live as Markdown in src/articles/. Each file's frontmatter sets its URL (slug),
// title, title tag (seoTitle), meta description, dek, cluster, publish date and sources.
// Affiliate links written into article Markdown get rel="sponsored" and open in a new tab.
const AFFILIATE_HOSTS = /^https?:\/\/go\.(aceable|driversed)\.com\//;
const markAffiliateLinks = (html) =>
  html.replace(/<a href="([^"]+)"/g, (m, href) =>
    AFFILIATE_HOSTS.test(href) ? `<a href="${href}" rel="sponsored noopener" target="_blank"` : m);

const modules = import.meta.glob('../articles/*.md', { eager: true });

const articles = await Promise.all(
  Object.values(modules).map(async (m) => {
    const fm = m.frontmatter;
    return {
      slug: fm.slug,
      title: fm.title,
      seoTitle: fm.seoTitle,
      description: fm.description,
      dek: fm.dek,
      cluster: fm.cluster,
      territory: fm.territory || null,
      author: fm.author || 'Robert Abbott',
      image: fm.image || null,
      imageSm: fm.imageSm || null,
      imageAlt: fm.imageAlt || '',
      published: fm.published,
      modified: fm.modified || fm.published,
      reviewed: fm.reviewed || fm.modified || fm.published,
      sources: fm.sources || [],
      html: expandFramework(markAffiliateLinks(await m.compiledContent())),
      howWeKnow: !!fm.howWeKnow,
      isNew: true,
    };
  })
);

const slugs = new Set();
for (const p of [...articles, ...legacy]) {
  if (slugs.has(p.slug)) throw new Error(`Duplicate article URL: /${p.slug}/`);
  slugs.add(p.slug);
}

// Newest first. Legacy WordPress posts keep their original slugs at the site root.
export const allPosts = [...articles, ...legacy].sort((a, b) => b.published.localeCompare(a.published));

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export const readingMinutes = (html) => {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
};

// Prefer other new articles, then fill with legacy posts.
export const related = (slug, n = 4) => {
  const others = allPosts.filter((p) => p.slug !== slug);
  return [...others.filter((p) => p.isNew), ...others.filter((p) => !p.isNew)].slice(0, n);
};

// Same-territory recommendations for the bottom of an article: other articles in its
// territory, the Learn feature and supporting links first, then the newest.
export const relatedInTerritory = (post, n = 3, priority = []) => {
  if (!post.territory) return [];
  const pool = allPosts.filter((p) => (p.territory === post.territory || priority.includes(p.slug)) && p.slug !== post.slug);
  const rank = (p) => { const i = priority.indexOf(p.slug); return i === -1 ? 99 : i; };
  return [...pool].sort((a, b) => rank(a) - rank(b)).slice(0, n);
};
