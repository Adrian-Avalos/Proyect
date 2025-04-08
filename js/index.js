
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

    function irLogin() {
      document.getElementById('modalLogin').classList.add('mostrar');
    }

    function cerrarModal() {
      document.getElementById('modalLogin').classList.remove('mostrar');
    }

    function togglePassword() {
      const input = document.getElementById('password');
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    function validarLogin(event) {
      event.preventDefault();
      const user = document.getElementById("email").value.trim().toUpperCase();
      const pass = document.getElementById("password").value.trim();

      if (user === "ADMINISTRADOR" && pass === "123**321") {
        location.href = "menu.html";
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    }
