'use strict';

// Attila highlights fenced code in the browser and draws its own line numbers.
// Leave Markdown fences as <pre><code class="language-...">.
hexo.config.syntax_highlighter = '';
hexo.config.marked = Object.assign({}, hexo.config.marked, {
  langPrefix: 'language-'
});

// markdown-it-mark follows CommonMark flanking. **==text==** opens strong
// only after whitespace or punctuation, so 能**==文字==** leaves the asterisks
// as text. Typora and Obsidian accept that stack mid-sentence; render it as
// <strong><mark> before the Markdown parser runs. Fenced and inline code stay
// untouched, and Markdown inside the pair (such as `code`) still parses.
function nestMarkAndStrong(src) {
  return String(src).replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`|\*\*==([\s\S]*?)==\*\*|==\*\*([\s\S]*?)\*\*==/g, function (match, strongInner, markInner) {
    if (strongInner != null) return '<strong><mark>' + strongInner + '</mark></strong>';
    if (markInner != null) return '<mark><strong>' + markInner + '</strong></mark>';
    return match;
  });
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (data && typeof data.content === 'string') data.content = nestMarkAndStrong(data.content);
  return data;
});

// A front-matter excerpt skips Hexo's <!--more--> split, so the marker stays in
// the HTML and shows up in atom.xml. The article page never renders it.
hexo.extend.filter.register('after_post_render', function (data) {
  if (data && typeof data.content === 'string') {
    data.content = data.content.replace(/<!-- ?more ?-->/gi, '');
  }
  return data;
}, 15);
