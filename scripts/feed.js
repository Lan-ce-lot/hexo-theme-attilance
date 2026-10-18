'use strict';

// hexo-server labels the feed application/atom+xml and omits charset.
// Browsers then read the UTF-8 bytes as Latin-1, so 年度总结 shows up as å¹´åº¦æ€»ç»“.
hexo.extend.filter.register('server_middleware', function (app) {
  app.use(function (req, res, next) {
    const setHeader = res.setHeader;
    res.setHeader = function (name, value) {
      if (typeof name === 'string' && name.toLowerCase() === 'content-type' && typeof value === 'string' && /(?:atom|rss)\+xml|\/xml\b/i.test(value) && !/charset=/i.test(value)) {
        value += '; charset=utf-8';
      }
      return setHeader.call(this, name, value);
    };
    next();
  });
}, 1);

// The theme links to /atom.xml. Generate a feed only when no feed plugin is loaded.
// hexo-generator-feed registers itself as "atom", not "feed".
const feedGenerators = hexo.extend.generator.list();
if (!feedGenerators.feed && !feedGenerators.atom && !feedGenerators.rss2) {
  hexo.extend.generator.register('feed', function (locals) {
    const rss = hexo.theme.config.rss || 'atom.xml';
    const path = String(rss).replace(/^\//, '');
    const site = hexo.config.url.replace(/\/$/, '');
    const posts = locals.posts.sort('-date').toArray();

    function xml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function iso(value) {
      if (!value) return new Date().toISOString();
      if (typeof value.toDate === 'function') return value.toDate().toISOString();
      return new Date(value).toISOString();
    }

    function permalink(postPath) {
      return site + '/' + String(postPath || '').replace(/^\//, '');
    }

    const entries = posts.map(function (post) {
      const link = permalink(post.path);
      const html = post.content || post.excerpt || '';
      return [
        '<entry>',
        '<title>' + xml(post.title) + '</title>',
        '<link href="' + xml(link) + '"/>',
        '<id>' + xml(link) + '</id>',
        '<published>' + iso(post.date) + '</published>',
        '<updated>' + iso(post.updated || post.date) + '</updated>',
        '<content type="html">' + xml(html) + '</content>',
        '</entry>'
      ].join('');
    }).join('');

    const data = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
      '<title>' + xml(hexo.config.title) + '</title>',
      '<link href="' + xml(permalink(path)) + '" rel="self"/>',
      '<link href="' + xml(site + '/') + '" rel="alternate"/>',
      '<updated>' + (posts.length ? iso(posts[0].updated || posts[0].date) : new Date().toISOString()) + '</updated>',
      '<id>' + xml(site + '/') + '</id>',
      '<author><name>' + xml(hexo.config.author || hexo.config.title) + '</name></author>',
      entries,
      '</feed>'
    ].join('');

    return { path: path, data: data };
  });
}
