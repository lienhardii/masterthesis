// Render section: Subtitle (optional) + Markdown Content (H1, H2, etc. bleiben erhalten)
function renderSection(content, subtitle = '', id = '') {
  return `
    <section id="${id}" class="section">
      ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
      <div class="section-content">
        ${content}
      </div>
    </section>
  `;
}

// Render thesis sections as full-width (stacked)
function renderThesisSections(thesisSections) {
  return thesisSections.map((section, index) => 
    renderSection(section.content, section.subtitle, `section-${index}`)
  ).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}