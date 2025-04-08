// © 2025 Ramón Adrian Avalos Verá (GitHub: Adrian-Avalos)
// Prohibida la copia o uso comercial sin autorización.
document.addEventListener("DOMContentLoaded", () => {
  // Slider automático
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${(i - index) * 100}%)`;
      dots[i].classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function autoSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(autoSlide, 6000);
  showSlide(0);

  // Login modal
  window.irLogin = function () {
    document.getElementById('modalLogin').classList.add('mostrar');
  }

  window.cerrarModal = function () {
    document.getElementById('modalLogin').classList.remove('mostrar');
  }

  window.togglePassword = function () {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  // Login con Supabase
  const supabaseClient = supabase.createClient(
    'https://djbuwtemavldytssbicb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYnV3dGVtYXZsZHl0c3NiaWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODIxOTMsImV4cCI6MjA1OTI1ODE5M30.VBwS5W5qEFaBVeXXITpGLZa5JSvXkZuaEIiYd33-oy4'
  );

  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Correo o contraseña incorrectos");
      console.error(error);
    } else {
      location.href = "menu.html";
    }
  });
});