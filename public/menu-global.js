// Controle do menu lateral
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  const closeSidebar = document.querySelector('.close-sidebar');
  
  // Abrir menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
      menuToggle.classList.add('active');
      document.body.classList.add('sidebar-open');
    });
  }
  
  // Fechar menu
  const closeMenu = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  };
  
  if (closeSidebar) {
    closeSidebar.addEventListener('click', closeMenu);
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMenu);
  }
  
  // Marcar item ativo baseado na URL atual
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && link.getAttribute('href') === currentPage) {
      item.classList.add('active');
    }
  });
  
  // Fechar menu ao clicar em um link (mobile)
  const menuLinks = document.querySelectorAll('.menu-item a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMenu();
      }
    });
  });
});
