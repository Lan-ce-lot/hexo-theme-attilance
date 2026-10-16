'use strict';

// Attila highlights fenced code in the browser and draws its own line numbers.
// Leave Markdown fences as <pre><code class="language-...">.
hexo.config.syntax_highlighter = '';
hexo.config.marked = Object.assign({}, hexo.config.marked, {
  langPrefix: 'language-'
});
