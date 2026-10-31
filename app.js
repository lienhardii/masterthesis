const app = {
  currentPage: 'start',
  manifest: null,
  content: { start: [], 'research-thesis': [], reflexion: [] },

  async init() {
    console.log('🚀 Initializing app with Pure.css...');
    
    // Load manifest
    this.manifest = await this.loadManifest();
    console.log('📋 Manifest loaded:', this.manifest);

    // Load all content files
    await this.loadAllContent();

    // Check URL hash for page to load
    const hash = window.location.hash.slice(1); // Remove #
    const validPages = ['research-thesis', 'reflexion', 'about'];
    if (hash && validPages.includes(hash)) {
      this.currentPage = hash;
      console.log('📍 Loaded from hash:', hash);
    }

    // Render initial page
    this.setCurrentPage(this.currentPage);

    // Listen for hash changes (back/forward button)
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.slice(1);
      const validPages = ['research-thesis', 'reflexion', 'about'];
      if (newHash && validPages.includes(newHash)) {
        this.setCurrentPage(newHash);
      } else if (!newHash) {
        // Empty hash = Start page
        this.setCurrentPage('start');
      }
    });

    console.log('✅ App initialized');
  },

  async loadManifest() {
    try {
      // Check environment: localhost vs GitHub Pages
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let url;
      if (isLocalhost) {
        // Local testing: load from ./
        url = './content-manifest.json';
      } else {
        // GitHub Pages: load from Raw GitHub
        url = 'https://raw.githubusercontent.com/lienhardii/masterthesis-website/main/content-manifest.json';
      }
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error loading manifest:', error);
      return { thesis: [], reflexion: [] };
    }
  },

  async loadAllContent() {
    // Initialize arrays (verhindert Duplikate bei mehrfachem Laden)
    this.content = { start: [], 'research-thesis': [], reflexion: [] };

    // Load start files
    if (this.manifest.start) {
      console.log('🏠 Loading start files:', this.manifest.start);
      for (const file of this.manifest.start) {
        const content = await this.loadMarkdownFile('content/start', file);
        this.content.start.push(content);
      }
      console.log('✅ Loaded start:', this.content.start.length, 'files');
    }

    // Load research-thesis files
    if (this.manifest['research-thesis']) {
      console.log('📚 Loading research-thesis files:', this.manifest['research-thesis']);
      for (const file of this.manifest['research-thesis']) {
        const content = await this.loadMarkdownFile('content/research-thesis', file);
        this.content['research-thesis'].push(content);
      }
      console.log('✅ Loaded research-thesis:', this.content['research-thesis'].length, 'files');
    }

    // Load reflexion files
    if (this.manifest.reflexion) {
      console.log('📝 Loading reflexion files:', this.manifest.reflexion);
      for (const file of this.manifest.reflexion) {
        const content = await this.loadMarkdownFile('content/reflexion', file);
        this.content.reflexion.push(content);
      }
      console.log('✅ Loaded reflexion:', this.content.reflexion.length, 'posts');
    }

    // Sort reflexion by date (newest first)
    if (this.content.reflexion) {
      this.content.reflexion.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async loadMarkdownFile(folder, filename) {
    try {
      // Check environment: localhost vs GitHub Pages
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let url;
      if (isLocalhost) {
        // Local testing: load from ./
        url = `./${folder}/${filename}`;
      } else {
        // GitHub Pages: load from Raw GitHub
        url = `https://raw.githubusercontent.com/lienhardii/masterthesis-website/main/${folder}/${filename}`;
      }
      
      const response = await fetch(url);
      const text = await response.text();
      return this.parseMarkdown(text);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return { title: 'Error', content: 'File not found', meta: {} };
    }
  },

  parseMarkdown(text) {
    let meta = {};
    let body = text;

    const lines = text.split('\n');

    // Check if text starts with --- (YAML frontmatter)
    if (lines[0].trim() === '---') {
      let frontmatterEnd = -1;

      // Find closing ---
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontmatterEnd = i;
          break;
        }
      }

      if (frontmatterEnd > 0) {
        // Extract frontmatter between --- and ---
        const frontmatterLines = lines.slice(1, frontmatterEnd);

        // Parse YAML frontmatter (key: value pairs)
        frontmatterLines.forEach(line => {
          if (line.trim()) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
              const key = line.substring(0, colonIndex).trim();
              const value = line.substring(colonIndex + 1).trim();

              if (key && value) {
                // Store title (mandatory, but not rendered in frontend)
                if (key.toLowerCase() === 'title') {
                  meta.title = value;
                } else if (key.toLowerCase() === 'subtitle') {
                  // Store subtitle for rendering
                  meta.subtitle = value;
                } else if (key.toLowerCase() === 'tags') {
                  // Parse comma-separated tags
                  meta.tags = value.split(',').map(t => t.trim()).filter(t => t);
                } else {
                  meta[key.toLowerCase()] = value;
                }
              }
            }
          }
        });

        // Extract body (everything after closing ---)
        body = lines.slice(frontmatterEnd + 1).join('\n').trim();
      }
    } else {
      console.warn('⚠️ Warning: No YAML frontmatter found. File must start with ---');
    }

    // Convert markdown to HTML
    const html = this.markdownToHtml(body);

    // Title is mandatory
    if (!meta.title) {
      console.error('❌ Error: "title" is mandatory in frontmatter but missing');
      return { 
        title: 'Error: Missing title', 
        subtitle: '', 
        date: '', 
        tags: [], 
        content: '<p>Error: "title" is mandatory in frontmatter</p>', 
        meta: {} 
      };
    }

    const result = {
      title: meta.title, // Store for internal use but not rendered
      subtitle: meta.subtitle || '',
      date: meta.date || new Date().toISOString().split('T')[0],
      tags: meta.tags || [],
      content: html,
      meta: meta // title is in meta but not rendered in templates
    };

    console.log('📄 Parsed:', result.title, '|', result.date, '| Tags:', result.tags.length > 0 ? result.tags.join(', ') : 'none');

    return result;
  },

  markdownToHtml(markdown) {
    let html = markdown;

    // Escape HTML first
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*?)(?:\{\.([^}]+)\})?$/gm, '<h3 class="$2">$1</h3>');
    html = html.replace(/^## (.*?)(?:\{\.([^}]+)\})?$/gm, '<h2 class="$2">$1</h2>');
    html = html.replace(/^# (.*?)(?:\{\.([^}]+)\})?$/gm, '<h1 class="$2">$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Images (AFTER italic/bold, so underscores in URLs aren't parsed as emphasis)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="responsive-image">');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Blockquote
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    // Lists
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul
    html = html.replace(/(<li>.*?<\/li>)/s, (match) => {
      return '<ul>' + match + '</ul>';
    });

    // Code blocks
    html = html.replace(/```(.*?)```/gs, (match, code) => {
      const escaped = code.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return '<pre><code>' + escaped + '</code></pre>';
    });

    // Custom CSS classes for inline text and links: [text]{.class-name}
    html = html.replace(/\[([^\]]+)\]\{\.([^}]+)\}/g, (match, text, className) => {
      // Check if it's a link-icon class
      if (className.includes('link-icon')) {
        return `<a href="#" class="${className}">${text}</a>`;
      }
      // Default to span for other classes
      return `<span class="${className}">${text}</span>`;
    });

    // Paragraphs
    html = html.replace(/\n\n+/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty tags
    html = html.replace(/<p>\s*<(h|ul|pre|blockquote|img)/g, '<$1');
    html = html.replace(/<\/(h|ul|pre|blockquote)>\s*<\/p>/g, '</$1>');
    html = html.replace(/<img([^>]*)>\s*<\/p>/g, '<img$1>');
    html = html.replace(/<p>\s*<img/g, '<img');
    html = html.replace(/<p><\/p>/g, '');

    // Decode HTML entities
    html = html.replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&amp;/g, '&');

    return html;
  },

  setCurrentPage(page) {
    this.currentPage = page;
    
    // Update URL hash (but not for start page)
    if (page === 'start') {
      window.location.hash = '';
    } else {
      window.location.hash = page;
    }
    
    // Render header + content
    renderHeader(page);
    this.renderContent();
    window.scrollTo(0, 0);
  },

  renderContent() {
    const contentDiv = document.getElementById('content');
    let html = '';

    if (this.currentPage === 'start') {
      html = this.renderStartPage();
    } else if (this.currentPage === 'research-thesis') {
      html = this.renderResearchThesisPage();
    } else if (this.currentPage === 'reflexion') {
      html = this.renderReflexionPage();
    } else if (this.currentPage === 'about') {
      html = this.renderAboutPage();
    }

    // Clear old content completely
    contentDiv.innerHTML = '';
    contentDiv.innerHTML = html;

    // Re-attach event listeners for tags (nur wenn vorhanden)
    document.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Tag clicked:', tag.dataset.tag);
      });
    });
  },

  renderStartPage() {
    // Render all start sections stacked (full-width)
    let html = '<div class="container">';
    if (this.content.start && this.content.start.length > 0) {
      html += renderThesisSections(this.content.start);
    } else {
      html += '<p>Bitte warten... </p>';
    }
    html += '</div>';

    return html;
  },

  renderResearchThesisPage() {
    // Render all research-thesis sections stacked (full-width)
    let html = '<div class="container">';
    if (this.content['research-thesis'] && this.content['research-thesis'].length > 0) {
      html += renderThesisSections(this.content['research-thesis']);
    } else {
      html += '<p>Inhalt folgt...</p>';
    }
    html += '</div>';

    return html;
  },

  renderReflexionPage() {
    let html = '<div class="container">';

        if (this.content.reflexion && this.content.reflexion.length > 0) {
      html += renderBlogPostsList(this.content.reflexion);
    } else {
      html += '<p>Inhalt folgt...</p>';
    }

    html += '</div>';
    return html;
  },

  renderAboutPage() {
    let html = '<div class="container">';

    html += '<p>Inhalt folgt...</p>';

    html += '</div>';
    return html;
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});