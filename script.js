// ===== Contagem regressiva Torneio 2 =====
const countdownElement2 = document.getElementById('countdown2');
const nextTournamentDate2 = new Date('2026-11-28T00:00:00');

function updateCountdown2() {
  if (!countdownElement2) return;

  const now = new Date();
  const diff = nextTournamentDate2 - now;

  if (diff <= 0) {
    countdownElement2.innerHTML = '<i class="fas fa-clock" style="margin-right:5px;"></i> O torneio já começou!';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownElement2.innerHTML = `<i class="fas fa-clock" style="margin-right:5px;"></i> Contagem regressiva: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown2, 1000);
updateCountdown2();

// ===== Toggle dos banners =====
function configurarToggle(toggleId, bannerId, conteudoId) {
  const toggleBtn = document.getElementById(toggleId);
  const banner = document.getElementById(bannerId);
  const conteudo = document.getElementById(conteudoId);

  if (!toggleBtn || !banner || !conteudo) return;

  toggleBtn.addEventListener("click", function () {
  const icon = this.querySelector("i");
  const aberto = banner.classList.contains("show");

  if (aberto) {
    banner.classList.remove("show");
    setTimeout(() => {
      banner.style.display = "none";
    }, 300);
    conteudo.style.display = "block";
  } else {
    banner.style.display = "block";
    setTimeout(() => {
      banner.classList.add("show");
    }, 10);
    conteudo.style.display = "none";
  }

  if (icon) {
    icon.classList.toggle("fa-chevron-right", aberto);
    icon.classList.toggle("fa-chevron-down", !aberto);
  }
});
}

configurarToggle("toggleBanner", "bannerTorneio2", "proximoTorneioConteudo");

// ===== Toggle do vídeo Seção Sobre =====
const toggleVideoBtn = document.getElementById('toggleVideo');
const videoContainer = document.getElementById('videoSobre');
const sobreInfo = document.getElementById('sobreInfo');
const sobreTitle = document.querySelector('#SobreConteudo > h2');

if (toggleVideoBtn && videoContainer) {
  toggleVideoBtn.addEventListener('click', () => {
    const aberto = videoContainer.style.display === 'block';
    videoContainer.style.display = aberto ? 'none' : 'block';

    if (sobreInfo) sobreInfo.style.display = aberto ? 'block' : 'none';
    if (sobreTitle) sobreTitle.style.display = aberto ? 'block' : 'none';

    toggleVideoBtn.innerHTML = aberto
      ? '<i class="fas fa-chevron-right"></i>'
      : '<i class="fas fa-chevron-down"></i>';
  });
}

// ===== Rolagem suave =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.getBoundingClientRect().top + window.scrollY - document.querySelector("header").offsetHeight - 15,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Filtros (com execução inicial) =====
const yearFilter = document.getElementById('yearFilter');
const galleryItems = document.querySelectorAll('#galeria .result-item');

function filtrarGaleria() {
  if (!yearFilter) return;
  const selectedYear = yearFilter.value;
  galleryItems.forEach(item => {
    item.style.display = (item.dataset.year === selectedYear) ? 'flex' : 'none';
  });
}

if (yearFilter) {
  yearFilter.addEventListener('change', filtrarGaleria);
  filtrarGaleria(); // <<< aplica 2026 ao carregar
}

const yearResultsFilter = document.getElementById('yearResultsFilter');
const resultsItems = document.querySelectorAll('#resultados .result-item');

function filtrarResultados() {
  if (!yearResultsFilter) return;
  const selectedYear = yearResultsFilter.value;
  resultsItems.forEach(item => {
    item.style.display = (item.dataset.year === selectedYear) ? 'flex' : 'none';
  });
}

if (yearResultsFilter) {
  yearResultsFilter.addEventListener('change', filtrarResultados);
  filtrarResultados(); // <<< aplica 2026 ao carregar
}

const yearTransmissoesFilter = document.getElementById('yearTransmissoesFilter');
const transmissoesItems = document.querySelectorAll('#partidas-transmitidas .result-item');

function filtrarTransmissoes() {
  if (!yearTransmissoesFilter) return;
  const selectedYear = yearTransmissoesFilter.value;
  transmissoesItems.forEach(item => {
    item.style.display = item.classList.contains('ano-' + selectedYear) ? 'flex' : 'none';
  });
}

if (yearTransmissoesFilter) {
  yearTransmissoesFilter.addEventListener('change', filtrarTransmissoes);
  filtrarTransmissoes(); // <<< aplica 2026 ao carregar
}

// ===== Menu hamburguer =====
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('header nav');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });
}

if (navMenu) {
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('show'));
  });
}

function toggleClassificados() {
  const sub = document.getElementById("classificados-sub");
  if (!sub) return;
  sub.style.display = (sub.style.display === "none" || sub.style.display === "") ? "flex" : "none";
}
