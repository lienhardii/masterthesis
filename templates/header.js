function renderHeader(currentPage = 'start') {
  const header = document.getElementById('header-container');
  
  header.innerHTML = `
    <header class="header">
      <p class="header-logo"><a href="./">Jasmin Lienhard</a></p>
      
      <!-- Desktop Navigation -->
      <nav class="header-nav desktop-nav">
        <a href="#" class="nav-link ${currentPage === 'thesis' ? 'active' : ''}" data-page="thesis">Research-Thesis</a>
        <a href="#" class="nav-link ${currentPage === 'reflexion' ? 'active' : ''}" data-page="reflexion">Reflexion</a>
        <a href="#" class="nav-link ${currentPage === 'about' ? 'active' : ''}" data-page="about">About</a>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="hamburger" id="hamburger-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    <!-- Mobile Menu (Full-Screen) -->
    <div class="mobile-menu" id="mobile-menu">
      <nav class="mobile-menu-nav">
        <a href="#" class="mobile-nav-link ${currentPage === 'thesis' ? 'active' : ''}" data-page="thesis">Research-Thesis</a>
        <a href="#" class="mobile-nav-link ${currentPage === 'reflexion' ? 'active' : ''}" data-page="reflexion">Reflexion</a>
        <a href="#" class="mobile-nav-link ${currentPage === 'about' ? 'active' : ''}" data-page="about">About</a>
      </nav>
    </div>
  `;

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
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
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open menu');
        }
      }
    });
  });
}

// Call on page load
renderHeader();