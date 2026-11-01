// Render footer
function renderFooter() {
  const footerContainer = document.getElementById('footer-container');
  
  if (!footerContainer) {
    console.warn('⚠️ Footer container (footer-container) not found');
    return;
  }

  footerContainer.innerHTML = `
    <footer>
      <div class="footer-content">
        <p class="footer-copyright">© Jasmin Lienhard</p>
        <p class="footer-info">Master of Arts Eco Social Design HSLU</p>
      </div>
    </footer>
  `;
  
  console.log('✅ Footer rendered');
}

/*
// Render immediately when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFooter);
} else {
  renderFooter();
}
  */