#!/usr/bin/env node
/**
 * ============================================================
 * MUSIC VISUALIZER PRO — MULTILINGUAL SSG BUILD SCRIPT v4
 * build-ssg.js
 *
 * Implements the 148-Language Blue Ocean SEO Multiplier.
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS, LANG_META } from './src/locales/translations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── GOLDEN RULE ────────────────────────────────────────────────────────────
const BASE_URL = 'https://musicvisualizerpro.com';
const DIST_DIR = path.join(__dirname, 'dist');
const TODAY    = new Date().toISOString().split('T')[0];

// ── CANONICAL ROUTES WHITELIST ─────────────────────────────────────────────
const CANONICAL_ROUTES = [
  { path: '/',          priority: '1.0', changefreq: 'weekly'  },
  { path: '/blog/',     priority: '0.8', changefreq: 'daily'   },
  { path: '/about/',    priority: '0.7', changefreq: 'monthly' },
  { path: '/contact/',  priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy/',  priority: '0.5', changefreq: 'yearly'  },
  { path: '/terms/',    priority: '0.5', changefreq: 'yearly'  },
];

const ELITE_BLOG_SLUGS = [
  { slug: '3d-music-visualizer-complete-guide',       date: '2025-07-01' },
  { slug: 'audio-reactive-videos-complete-guide',     date: '2025-07-08' },
  { slug: 'lyric-video-maker-guide',                  date: '2025-07-15' },
  { slug: 'music-visualization-software-comparison',  date: '2025-07-22' },
];

// ── TRANSLATION UTILS ──────────────────────────────────────────────────────
function t(lang, key) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['en'][key] || key;
}

function getPrefix(lang) {
  return lang === 'en' ? '' : `/${lang}`;
}

function getHreflangsBlock(routePath) {
  let tags = '';
  for (const lang of Object.keys(LANG_META)) {
    const url = `${BASE_URL}${getPrefix(lang)}${routePath}`;
    tags += `  <link rel="alternate" hreflang="${lang}" href="${url}">\n`;
  }
  // Default x-default
  tags += `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}${routePath}">\n`;
  return tags;
}

function getSitemapHreflangs(routePath) {
  let tags = '';
  for (const lang of Object.keys(LANG_META)) {
    const url = `${BASE_URL}${getPrefix(lang)}${routePath}`;
    tags += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />\n`;
  }
  tags += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${routePath}" />\n`;
  return tags;
}

// Removed Google Translate widget per Rule 1 to prevent cloaking/blank FOUC bugs.
// Relying purely on static SSG translation outputs.
const GOOGLE_TRANSLATE_WIDGET = '';

// ── JSON-LD SCHEMA ─────────────────────────────────────────────────────────
function getHomeSchema(lang) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': t(lang, 'site_name'),
    'url': `${BASE_URL}${getPrefix(lang)}/`,
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web, Windows, macOS',
    'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' }
  });
}

// ── PREMIUM BLOG CSS ───────────────────────────────────────────────────────
const BLOG_CSS = `
  /* ── Reset & Fonts ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --pink: #ff00cc; --purple: #bb86fc; --dark: #0a0a1a; --darker: #06060f;
    --card: #0d0d2b; --border: #2a0a4a; --text: #c8c8e8; --text-dim: #888aaa;
    --white: #f0f0ff; --grad: linear-gradient(135deg, #ff00cc, #6600ff);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--darker); color: var(--text); font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; min-height: 100vh; }
  [dir="rtl"] { text-align: right; }
  [dir="rtl"] .blog-nav__links, [dir="rtl"] .breadcrumb, [dir="rtl"] .blog-hero__meta { justify-content: flex-start; flex-direction: row-reverse; }

  /* NAV */
  .blog-nav { background: rgba(6,6,15,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; padding: 0 24px; }
  .blog-nav__inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 60px; gap: 16px; }
  .blog-nav__logo { font-size: 1.1rem; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; }
  .blog-nav__links { display: flex; gap: 24px; list-style: none; align-items: center; }
  .blog-nav__links a { color: var(--text-dim); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
  .blog-nav__links a:hover { color: var(--purple); }
  .blog-nav__cta { background: var(--grad); color: #fff !important; padding: 8px 18px; border-radius: 20px; font-weight: 700 !important; white-space: nowrap; transition: opacity 0.2s, transform 0.2s !important; }
  .blog-nav__cta:hover { opacity: 0.9; transform: translateY(-1px); }

  /* HERO BANNER */
  .blog-hero { background: linear-gradient(160deg, #12002a 0%, #0a0a1a 60%); border-bottom: 1px solid var(--border); padding: 56px 24px 48px; text-align: center; }
  .blog-hero__tag { display: inline-block; background: rgba(187,134,252,0.12); color: var(--purple); border: 1px solid rgba(187,134,252,0.3); border-radius: 20px; padding: 4px 14px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
  .blog-hero__title { font-size: clamp(1.6rem, 4vw, 2.6rem); font-weight: 800; color: var(--white); line-height: 1.2; max-width: 800px; margin: 0 auto 16px; }
  .blog-hero__meta { display: flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap; color: var(--text-dim); font-size: 0.85rem; margin-bottom: 28px; }
  .blog-hero__img { width: 100%; max-width: 800px; height: 200px; object-fit: cover; border-radius: 12px; border: 1px solid var(--border); display: block; margin: 0 auto; }

  /* LAYOUT */
  .blog-layout { max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }
  
  /* STATIC CONTENT */
  .static-hero { background: linear-gradient(160deg, #12002a 0%, #0a0a1a 60%); border-bottom: 1px solid var(--border); padding: 64px 24px 48px; text-align: center; }
  .static-hero h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
  .static-hero p { color: var(--text-dim); font-size: 1.05rem; max-width: 560px; margin: 0 auto; }
  .static-content { max-width: 820px; margin: 0 auto; padding: 56px 24px 80px; }
  .static-content h2 { color: var(--pink); font-size: 1.35rem; font-weight: 700; margin: 40px 0 14px; padding-top: 8px; border-top: 1px solid var(--border); }
  .static-content p { color: var(--text); line-height: 1.8; margin-bottom: 16px; }
  .static-content ul { padding-left: 24px; margin-bottom: 16px; }
  .static-content a { color: var(--purple); }
  
  /* FOOTER */
  .blog-footer { background: #06060f; border-top: 1px solid var(--border); padding: 48px 24px; text-align: center; }
  .blog-footer__logo { font-size: 1.2rem; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-decoration: none; display: inline-block; margin-bottom: 16px; }
  .blog-footer__links { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; list-style: none; }
  .blog-footer__links a { color: var(--text-dim); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
  .blog-footer__links a:hover { color: var(--purple); }
  .blog-footer__copy { color: var(--text-dim); font-size: 0.8rem; }
  
  .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 32px; }
  .blog-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; text-decoration: none; display: block; transition: transform 0.2s; }
  .blog-card:hover { border-color: var(--pink); transform: translateY(-4px); }
  .blog-card h3 { color: var(--white); font-size: 1.05rem; font-weight: 700; margin-bottom: 10px; }
  .blog-card p { color: var(--text-dim); font-size: 0.85rem; line-height: 1.6; margin-bottom: 14px; }
  .contact-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center; }
  .cta-btn { display: inline-block; background: var(--grad); color: #fff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 700; }
  .elite-post h2 { color: var(--pink); font-size: 1.5rem; font-weight: 700; margin: 48px 0 16px; padding-top: 8px; border-top: 1px solid var(--border); }
  .elite-post p { margin-bottom: 18px; }
  .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; font-size: 0.83rem; color: var(--text-dim); flex-wrap: wrap; }
  .breadcrumb a { color: var(--text-dim); text-decoration: none; }
  .breadcrumb a:hover { color: var(--purple); }
  
  /* Anti-FOUC Wrapper */
  .trans-wrap { transition: opacity 0.3s; }
`;

// ── NAV & FOOTER HTML ──────────────────────────────────────────────────────
function getNav(lang) {
  const pfx = getPrefix(lang);
  return `<nav class="blog-nav" aria-label="${t(lang, 'nav_home')}">
  <div class="blog-nav__inner">
    <a href="${BASE_URL}${pfx}/" class="blog-nav__logo">🎵 ${t(lang, 'site_name')}</a>
    <ul class="blog-nav__links">
      <li><a href="${BASE_URL}${pfx}/">${t(lang, 'nav_home')}</a></li>
      <li><a href="${BASE_URL}${pfx}/blog/">${t(lang, 'nav_blog')}</a></li>
      <li><a href="${BASE_URL}${pfx}/about/">${t(lang, 'nav_about')}</a></li>
      <li><a href="${BASE_URL}${pfx}/" class="blog-nav__cta">${t(lang, 'nav_cta')}</a></li>
    </ul>
  </div>
</nav>`;
}

function getFooter(lang) {
  const pfx = getPrefix(lang);
  const year = new Date().getFullYear();
  return `<footer class="blog-footer">
  <a href="${BASE_URL}${pfx}/" class="blog-footer__logo">${t(lang, 'site_name')}</a>
  <ul class="blog-footer__links">
    <li><a href="${BASE_URL}${pfx}/">${t(lang, 'nav_home')}</a></li>
    <li><a href="${BASE_URL}${pfx}/blog/">${t(lang, 'nav_blog')}</a></li>
    <li><a href="${BASE_URL}${pfx}/about/">${t(lang, 'nav_about')}</a></li>
    <li><a href="${BASE_URL}${pfx}/contact/">${t(lang, 'nav_contact')}</a></li>
    <li><a href="${BASE_URL}${pfx}/privacy/">${t(lang, 'nav_privacy')}</a></li>
    <li><a href="${BASE_URL}${pfx}/terms/">${t(lang, 'nav_terms')}</a></li>
  </ul>
  <p class="blog-footer__copy">© ${year} ${t(lang, 'site_name')}. All rights reserved.</p>
</footer>`;
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function readFile(p)        { return fs.readFileSync(p, 'utf-8'); }
function writeFile(p, data) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data, 'utf-8'); }

// ── BUILD STATIC PAGES ─────────────────────────────────────────────────────
function buildStaticPage({ lang, slug, routePath, title, description, bodyContent, schema }) {
  const pfx = getPrefix(lang);
  const canonical = `${BASE_URL}${pfx}${routePath}`;
  const dirAttr = LANG_META[lang].dir === 'rtl' ? 'dir="rtl"' : '';
  const langCode = lang === 'en' ? 'en' : lang; // TODO: properly map ISO codes if needed
  
  const seoBlock = `
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${BASE_URL}/branding/music_visualizer_cover_16x9.png">
  <meta property="og:site_name" content="${t(lang, 'site_name')}">
  <meta property="og:locale" content="${langCode}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
${getHreflangsBlock(routePath)}
  ${schema ? `<script type="application/ld+json">${schema}</script>` : ''}`;

  const html = `<!DOCTYPE html>
<html lang="${langCode}" ${dirAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-adsense-account" content="ca-pub-4157219900484080">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4157219900484080" crossorigin="anonymous"></script>
  <link rel="icon" href="${BASE_URL}/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="96x96" href="${BASE_URL}/favicon-96x96.png">
  <link rel="apple-touch-icon" href="${BASE_URL}/apple-touch-icon.png">
  ${seoBlock}
  <style>${BLOG_CSS}</style>
</head>
<body ${dirAttr}>
<div class="trans-wrap">
${getNav(lang)}
${bodyContent}
${getFooter(lang)}
</div>
${GOOGLE_TRANSLATE_WIDGET}
</body>
</html>`;

  const outPath = path.join(DIST_DIR, pfx, slug, 'index.html');
  writeFile(outPath, html);
}

// ── BUILD BLOG POSTS ───────────────────────────────────────────────────────
function buildPostPage({ lang, post }) {
  const pfx = getPrefix(lang);
  const routePath = `/blog/${post.slug}/`;
  const canonical = `${BASE_URL}${pfx}${routePath}`;
  const dateStr = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dirAttr = LANG_META[lang].dir === 'rtl' ? 'dir="rtl"' : '';
  
  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': t(lang, 'nav_home'),  'item': `${BASE_URL}${pfx}/` },
      { '@type': 'ListItem', 'position': 2, 'name': t(lang, 'nav_blog'),  'item': `${BASE_URL}${pfx}/blog/` },
      { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': canonical }
    ]
  });

  const blogSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'url': canonical,
    'datePublished': post.date,
    'dateModified': TODAY,
    'author': { '@type': 'Organization', 'name': t(lang, 'site_name'), 'url': `${BASE_URL}${pfx}/` },
    'publisher': {
      '@type': 'Organization',
      'name': t(lang, 'site_name'),
      'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/favicon-96x96.png` }
    },
    'image': post.hero_image || `${BASE_URL}/branding/music_visualizer_cover_16x9.png`,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical }
  });

  const html = `<!DOCTYPE html>
<html lang="${lang}" ${dirAttr}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google-adsense-account" content="ca-pub-4157219900484080">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4157219900484080" crossorigin="anonymous"></script>

  <title>${post.title} | ${t(lang, 'site_name')}</title>
  <meta name="description" content="${post.excerpt}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt}">
  <meta property="og:image" content="${post.hero_image || `${BASE_URL}/branding/music_visualizer_cover_16x9.png`}">
  <meta property="og:site_name" content="${t(lang, 'site_name')}">
  <meta property="og:locale" content="${lang}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.excerpt}">
  
  <link rel="preload" as="image" href="${post.hero_image || `${BASE_URL}/branding/music_visualizer_cover_16x9.png`}">
  
  <link rel="icon" href="${BASE_URL}/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="48x48" href="${BASE_URL}/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="${BASE_URL}/favicon-96x96.png">
  <link rel="apple-touch-icon" href="${BASE_URL}/apple-touch-icon.png">
  
${getHreflangsBlock(routePath)}
  <script type="application/ld+json">${breadcrumbSchema}</script>
  <script type="application/ld+json">${blogSchema}</script>
  <style>${BLOG_CSS}</style>
</head>
<body ${dirAttr}>
<div class="trans-wrap">
${getNav(lang)}
<header class="blog-hero">
  <span class="blog-hero__tag">${post.category.replace(/-/g, ' ')}</span>
  <h1 class="blog-hero__title">${post.title}</h1>
  <div class="blog-hero__meta">
    <span>✍️ ${post.author}</span>
    <span>📅 ${dateStr}</span>
    <span>⏱️ ${post.read_time}</span>
  </div>
</header>
<main class="blog-layout">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="${BASE_URL}${pfx}/">${t(lang, 'nav_home')}</a>
    <span>›</span>
    <a href="${BASE_URL}${pfx}/blog/">${t(lang, 'nav_blog')}</a>
    <span>›</span>
    <span>${post.title}</span>
  </nav>
  ${post.content}
</main>
${getFooter(lang)}
</div>
${GOOGLE_TRANSLATE_WIDGET}
</body>
</html>`;

  const outPath = path.join(DIST_DIR, pfx, 'blog', post.slug, 'index.html');
  writeFile(outPath, html);
}

// ── MULTILINGUAL GENERATION ────────────────────────────────────────────────
function generateAllPages() {
  const posts = JSON.parse(readFile(path.join(__dirname, 'elite_posts.json')));
  const langs = Object.keys(LANG_META);
  
  for (const lang of langs) {
    const pfx = getPrefix(lang);
    console.log(`Generating pages for language: ${lang} (${LANG_META[lang].name})`);
    
    // 1. Home Page SEO Patch
    const isRoot = lang === 'en';
    if (isRoot) {
      // Patch root index.html
      const homePath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(homePath)) {
        let html = readFile(homePath);
        const seoBlock = `
  <title>${t(lang, 'home_title')}</title>
  <meta name="description" content="${t(lang, 'home_desc')}">
  <link rel="canonical" href="${BASE_URL}/">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/">
  <meta property="og:title" content="${t(lang, 'home_title')}">
  <meta property="og:description" content="${t(lang, 'home_desc')}">
  <meta property="og:image" content="${BASE_URL}/branding/music_visualizer_cover_16x9.png">
  <meta property="og:site_name" content="${t(lang, 'site_name')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t(lang, 'home_title')}">
  <meta name="twitter:description" content="${t(lang, 'home_desc')}">
${getHreflangsBlock('/')}
  <script type="application/ld+json">${getHomeSchema(lang)}</script>`;

        html = html.replace(/<title>.*?<\/title>/si, '');
        html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
        html = html.replace('</head>', `${seoBlock}\n</head>`);
        // Wrap app body in translate widget if needed, but home page is special SPA.
        if (!html.includes('google_translate_element')) {
          html = html.replace('</body>', `${GOOGLE_TRANSLATE_WIDGET}\n</body>`);
        }
        writeFile(homePath, html);
      }
    } else {
      // Create subfolder index.html for home by copying root and patching
      const rootHome = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(rootHome)) {
        let html = readFile(rootHome);
        const seoBlock = `
  <title>${t(lang, 'home_title')}</title>
  <meta name="description" content="${t(lang, 'home_desc')}">
  <link rel="canonical" href="${BASE_URL}/${lang}/">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}/${lang}/">
  <meta property="og:title" content="${t(lang, 'home_title')}">
  <meta property="og:description" content="${t(lang, 'home_desc')}">
  <meta property="og:image" content="${BASE_URL}/branding/music_visualizer_cover_16x9.png">
  <meta property="og:site_name" content="${t(lang, 'site_name')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t(lang, 'home_title')}">
  <meta name="twitter:description" content="${t(lang, 'home_desc')}">
${getHreflangsBlock('/')}
  <script type="application/ld+json">${getHomeSchema(lang)}</script>`;

        html = html.replace(/<title>.*?<\/title>/si, '');
        html = html.replace(/<link rel="canonical"[^>]*>/gi, '');
        html = html.replace('</head>', `${seoBlock}\n</head>`);
        // Ensure proper lang attr and dir
        html = html.replace(/<html[^>]*>/, `<html lang="${lang}" ${LANG_META[lang].dir === 'rtl' ? 'dir="rtl"' : ''}>`);
        
        writeFile(path.join(DIST_DIR, lang, 'index.html'), html);
      }
    }

    // 2. Build Blog Index
    const blogCards = posts.map(p => `
      <a href="${BASE_URL}${pfx}/blog/${p.slug}/" class="blog-card">
        <span class="blog-card__tag">${(p.category || 'music').replace(/-/g,' ')}</span>
        <h3>${p.title}</h3>
        <p>${p.excerpt.slice(0, 130)}...</p>
        <div class="blog-card__meta">
          <span>📅 ${new Date(p.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
          <span>⏱️ ${p.read_time}</span>
        </div>
      </a>`).join('');

    buildStaticPage({
      lang,
      slug: 'blog',
      routePath: '/blog/',
      title: t(lang, 'blog_index_title'),
      description: t(lang, 'blog_index_desc'),
      schema: JSON.stringify({ '@context':'https://schema.org','@type':'CollectionPage','name':t(lang, 'blog_index_title'),'url':`${BASE_URL}${pfx}/blog/`,'description':t(lang, 'blog_index_desc') }),
      bodyContent: `
<header class="static-hero">
  <h1>${t(lang, 'blog_index_title')}</h1>
  <p>${t(lang, 'blog_index_desc')}</p>
</header>
<main class="static-content">
  <div class="blog-grid">${blogCards}</div>
</main>`
    });

    // 3. Build Static Pages (About, Contact, Privacy, Terms)
    buildStaticPage({
      lang, slug: 'about', routePath: '/about/',
      title: t(lang, 'about_title'), description: t(lang, 'about_desc'),
      schema: JSON.stringify({ '@context':'https://schema.org','@type':'AboutPage','name':t(lang, 'about_title'),'url':`${BASE_URL}${pfx}/about/` }),
      bodyContent: `
<header class="static-hero"><h1>${t(lang, 'about_title')}</h1><p>${t(lang, 'about_desc')}</p></header>
<main class="static-content">
  <h2>Our Mission</h2>
  <p>Music Visualizer Pro was built with one goal: make stunning music visualization accessible to everyone. No expensive software. No complicated setup. Just upload your audio and watch it transform into a cinematic 3D experience.</p>
  <p>We believe every musician — whether a bedroom producer or a seasoned professional — deserves broadcast-quality visuals for their music. Our web-based platform uses WebGL, the Web Audio API, and WebCodecs to deliver GPU-accelerated real-time rendering that exports directly to HD MP4 — right in your browser.</p>
  <h2>What We Build</h2>
  <ul>
    <li><strong>3D Music Visualizers</strong> — WebGL-powered particle systems, geometric meshes, and reactive waveforms</li>
    <li><strong>Lyric Video Creator</strong> — Time-synchronized LRC lyric overlays with animated text styles</li>
    <li><strong>Audio Reactive Animations</strong> — Every visual element driven by real-time frequency data</li>
    <li><strong>HD MP4 Export</strong> — Hardware-accelerated H.264 encoding at 1080p and 4K</li>
    <li><strong>Offline Desktop App</strong> — Available for Windows and macOS via Electron</li>
  </ul>
  <h2>Our Technology</h2>
  <p>Music Visualizer Pro is built on modern open-web standards:</p>
  <ul>
    <li><strong>Web Audio API</strong> — For real-time FFT frequency analysis (0–20,000 Hz)</li>
    <li><strong>WebGL / Three.js</strong> — GPU-accelerated 3D rendering at 60fps</li>
    <li><strong>WebCodecs API</strong> — Hardware-accelerated H.264 video encoding</li>
    <li><strong>mp4-muxer</strong> — Client-side MP4 packaging with perfect A/V sync</li>
  </ul>
  <h2>Trusted by Creators Worldwide</h2>
  <p>Over <strong>50,000 musicians, DJs, and video creators</strong> have used Music Visualizer Pro to produce YouTube lyric videos, Spotify Canvas loops, TikTok content, and live-stream visuals. Our average rating is <strong>4.9/5</strong> based on 1,847 reviews.</p>
  <div class="cta-block" style="margin-top:40px">
    <h3>Ready to Visualize Your Music?</h3>
    <p>Free to use. No sign-up required. Start creating in seconds.</p>
    <a href="${BASE_URL}${pfx}/" class="cta-btn">${t(lang, 'nav_cta')}</a>
  </div>
</main>`
    });

    buildStaticPage({
      lang, slug: 'contact', routePath: '/contact/',
      title: t(lang, 'contact_title'), description: t(lang, 'contact_desc'),
      schema: JSON.stringify({ '@context':'https://schema.org','@type':'ContactPage','name':t(lang, 'contact_title'),'url':`${BASE_URL}${pfx}/contact/` }),
      bodyContent: `
<header class="static-hero"><h1>${t(lang, 'contact_title')}</h1><p>${t(lang, 'contact_desc')}</p></header>
<main class="static-content">
  <div class="contact-card">
    <h3>📧 General Support</h3>
    <p>For help with the visualizer, export issues, or account questions:</p>
    <p><a href="mailto:support@musicvisualizerpro.com">support@musicvisualizerpro.com</a></p>
  </div>
  <div class="contact-card">
    <h3>💼 Business & Partnerships</h3>
    <p>For licensing, API access, white-label solutions, or media inquiries:</p>
    <p><a href="mailto:hello@musicvisualizerpro.com">hello@musicvisualizerpro.com</a></p>
  </div>
  <div class="contact-card">
    <h3>🐛 Bug Reports & Feature Requests</h3>
    <p>Found a bug or have an idea to make the visualizer even better?</p>
    <p><a href="mailto:feedback@musicvisualizerpro.com">feedback@musicvisualizerpro.com</a></p>
  </div>
  <h2>Response Times</h2>
  <ul>
    <li>General support: within 24–48 hours</li>
    <li>Business inquiries: within 1–3 business days</li>
    <li>Bug reports: acknowledged within 24 hours, fixed in next release</li>
  </ul>
  <p>For fastest support, please include your browser name/version, operating system, and a description of the issue or a screenshot if applicable.</p>
</main>`
    });

    buildStaticPage({
      lang, slug: 'privacy', routePath: '/privacy/',
      title: t(lang, 'privacy_title'), description: t(lang, 'privacy_desc'),
      bodyContent: `
<header class="static-hero"><h1>${t(lang, 'privacy_title')}</h1><p>${t(lang, 'privacy_desc')}</p></header>
<main class="static-content">
  <p>Music Visualizer Pro ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit <a href="${BASE_URL}/">${BASE_URL}</a>.</p>
  <h2>1. Information We Collect</h2>
  <h3>Automatically Collected Data</h3>
  <p>When you visit our site, we automatically collect certain information from your device, including your browser type, operating system, referring URLs, IP address (anonymized), and pages visited. This data is collected via Google Analytics and is used solely for improving our service.</p>
  <h3>Audio Files</h3>
  <p><strong>Your audio files are processed entirely in your browser.</strong> We do not upload, store, or transmit your music files to any server. All visualization and video encoding happens locally on your device using Web Audio API and WebCodecs — your music never leaves your computer.</p>
  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To operate, maintain, and improve Music Visualizer Pro</li>
    <li>To analyze usage patterns and optimize performance</li>
    <li>To serve relevant advertisements via Google AdSense</li>
    <li>To detect, prevent, and address technical issues</li>
  </ul>
  <h2>3. Google AdSense & Cookies</h2>
  <p>We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our site or other sites. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" rel="noopener">Google Ad Settings</a>. We use only essential and analytics cookies. No personal data is sold to third parties.</p>
  <h2>4. Third-Party Services</h2>
  <ul>
    <li><strong>Google Analytics</strong> — Anonymized usage analytics</li>
    <li><strong>Google AdSense</strong> — Advertising platform</li>
    <li><strong>Firebase Hosting</strong> — Website hosting (anonymized access logs only)</li>
  </ul>
  <h2>9. Contact</h2>
  <p>For privacy-related questions: <a href="mailto:privacy@musicvisualizerpro.com">privacy@musicvisualizerpro.com</a></p>
</main>`
    });

    buildStaticPage({
      lang, slug: 'terms', routePath: '/terms/',
      title: t(lang, 'terms_title'), description: t(lang, 'terms_desc'),
      bodyContent: `
<header class="static-hero"><h1>${t(lang, 'terms_title')}</h1><p>${t(lang, 'terms_desc')}</p></header>
<main class="static-content">
  <p>Please read these Terms of Service carefully before using Music Visualizer Pro at <a href="${BASE_URL}/">${BASE_URL}</a>. By accessing or using our service, you agree to be bound by these terms.</p>
  <h2>1. Use of Service</h2>
  <p>Music Visualizer Pro grants you a limited, non-exclusive, non-transferable, revocable license to use the service for personal, non-commercial purposes. You may use the service to create visualizer videos for your own music and upload them to social media platforms including YouTube, TikTok, Instagram, and Spotify.</p>
  <h2>2. Acceptable Use</h2>
  <p>You agree NOT to:</p>
  <ul>
    <li>Use the service to process audio you do not own or have rights to</li>
    <li>Attempt to reverse-engineer, decompile, or extract the source code</li>
    <li>Use automated tools to scrape or abuse the platform</li>
    <li>Upload audio containing malicious code or exploits</li>
    <li>Violate any applicable laws or third-party rights</li>
  </ul>
  <h2>3. Intellectual Property</h2>
  <p>You retain all rights to your audio files and the videos you create with our tool. Music Visualizer Pro retains all rights to the software, UI, algorithms, and visual designs of the platform itself. The visualizer presets and visual effects are the intellectual property of Music Visualizer Pro.</p>
  <h2>10. Contact</h2>
  <p>For questions about these terms: <a href="mailto:legal@musicvisualizerpro.com">legal@musicvisualizerpro.com</a></p>
</main>`
    });

    // 4. Build Elite Posts
    for (const post of posts) {
      // Fix links for this language specifically (deep copy string)
      let localizedContent = post.content
        .replace(/href="\/blog\//g, `href="${BASE_URL}${pfx}/blog/`)
        .replace(/href="\//g, `href="${BASE_URL}${pfx}/`);
        
      const p = { ...post, content: localizedContent };
      buildPostPage({ lang, post: p });
    }
  }
}

// ── PHASE 4: GENERATE MULTILINGUAL SITEMAP ────────────────────────────────
function generateMultilingualSitemap() {
  const entries = [];
  const langs = Object.keys(LANG_META);
  
  // Base Canonical Routes
  for (const r of CANONICAL_ROUTES) {
    for (const lang of langs) {
      const url = `${BASE_URL}${getPrefix(lang)}${r.path}`;
      const hreflangs = getSitemapHreflangs(r.path);
      entries.push(`  <url>\n    <loc>${url}</loc>\n${hreflangs}    <lastmod>${TODAY}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`);
    }
  }

  // Blog Posts
  for (const p of ELITE_BLOG_SLUGS) {
    const routePath = `/blog/${p.slug}/`;
    for (const lang of langs) {
      const url = `${BASE_URL}${getPrefix(lang)}${routePath}`;
      const hreflangs = getSitemapHreflangs(routePath);
      entries.push(`  <url>\n    <loc>${url}</loc>\n${hreflangs}    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`);
    }
  }
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>`;
  writeFile(path.join(DIST_DIR, 'sitemap.xml'), xml);
  console.log(`[SUCCESS] Multilingual Sitemap: ${entries.length} URLs across ${langs.length} languages`);
}

// ── PHASE 5: GENERATE ROBOTS.TXT ──────────────────────────────────────────
function generateRobots() {
  let allowBlocks = `Allow: /\n`;
  for (const lang of Object.keys(LANG_META)) {
    if (lang !== 'en') allowBlocks += `Allow: /${lang}/\n`;
  }
  
  const txt = `User-agent: *\n${allowBlocks}\nUser-agent: Googlebot-Image\nAllow: /branding/\nAllow: /\n\nUser-agent: Mediapartners-Google\nAllow: /\n\nUser-agent: AdsBot-Google\nAllow: /\n\nDisallow: /admin/\nDisallow: /login/\nDisallow: /search/\nDisallow: /thank-you/\nDisallow: /*?*\n\nSitemap: ${BASE_URL}/sitemap.xml`;
  writeFile(path.join(DIST_DIR, 'robots.txt'), txt);
  writeFile(path.join(__dirname, 'public', 'robots.txt'), txt);
  console.log('[SUCCESS] robots.txt generated with 148+ language allowances');
}

// ── MAIN ───────────────────────────────────────────────────────────────────
function main() {
  console.log('\n[START] Music Visualizer Pro -- 148-Language Multiplier (v4)');
  console.log('--------------------------------------------------------\n');

  console.log(`[PHASE 1] Generating ${Object.keys(LANG_META).length} Language Pages...`);
  generateAllPages();

  console.log('\n[PHASE 2] Generating Multilingual Sitemap with hreflangs...');
  generateMultilingualSitemap();

  console.log('\n[PHASE 3] Generating robots.txt...');
  generateRobots();

  const totalPages = (CANONICAL_ROUTES.length + ELITE_BLOG_SLUGS.length) * Object.keys(LANG_META).length;
  console.log('\n--------------------------------------------------------');
  console.log('[DONE] MULTILINGUAL BUILD COMPLETE');
  console.log(`[INFO] Base URL  : ${BASE_URL}`);
  console.log(`[INFO] Languages : ${Object.keys(LANG_META).length}`);
  console.log(`[INFO] Sitemap   : ${totalPages} physical URLs`);
  console.log('--------------------------------------------------------\n');
}

main();
