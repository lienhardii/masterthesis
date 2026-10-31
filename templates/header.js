function renderHeader(currentPage = 'start') {
  const header = document.getElementById('header-container');
  
  header.innerHTML = `
    <header class="header">
      <p class="header-logo"><a href="./">Jasmin Lienhard</a></p>
      
      <!-- Desktop Navigation -->
      <nav class="header-nav desktop-nav">
        <a href="#" class="nav-link ${currentPage === 'research-thesis' ? 'active' : ''}" data-page="research-thesis">Research-Thesis</a>
        <a href="#" class="nav-link ${currentPage === 'reflexion' ? 'active' : ''}" data-page="reflexion">Reflexion</a>
        <a href="#" class="nav-link ${currentPage === 'about' ? 'active' : ''}" data-page="about">About</a>
      </nav>

      <!-- Mobile Hamburger Button -->
      <button class="hamburger" id="hamburger-btn" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Mobile Menu (Full-Screen) -->
    <div class="mobile-menu" id="mobile-menu">
      <div class="mobile-menu-header">
        <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close">✕</button>
      </div>
      <nav class="mobile-menu-nav">
        <a href="#" class="mobile-nav-link ${currentPage === 'research-thesis' ? 'active' : ''}" data-page="research-thesis">Research-Thesis</a>
        <a href="#" class="mobile-nav-link ${currentPage === 'reflexion' ? 'active' : ''}" data-page="reflexion">Reflexion</a>
        <a href="#" class="mobile-nav-link ${currentPage === 'about' ? 'active' : ''}" data-page="about">About</a>
      </nav>
    </div>
  `;

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

  // Add click handlers to all nav links (desktop + mobile)
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.dataset.page;
      if (app && app.setCurrentPage) {
        app.setCurrentPage(page);
        // Close mobile menu if open
        if (mobileMenu) {
          mobileMenu.classList.remove('open');
        }
      }
    });
  });
}

// Call on page load
renderHeader();