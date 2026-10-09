import legacy from '../data/posts.json';

// New articles live as Markdown in src/articles/. Each file's frontmatter sets its URL (slug),
// title, title tag (seoTitle), meta description, dek, cluster, publish date and sources.
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
      author: fm.author || 'Robert Abbott',
      image: fm.image || null,
      published: fm.published,
      modified: fm.modified || fm.published,
      sources: fm.sources || [],
      html: await m.compiledContent(),
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
