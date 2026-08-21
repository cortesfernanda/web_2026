/* ==========================================================================
   LÓGICA E INTERACTIVIDAD PRINCIPAL (JavaScript)
   ========================================================================== */

// Este evento 'DOMContentLoaded' se ejecuta de forma automática en cuanto el navegador
// termina de leer todo el documento HTML, asegurando que los elementos ya existan en pantalla.
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cada uno de los módulos de interacción
    initCanvasParticles(); // Partículas en movimiento
    initNavbarScroll();    // Comportamiento de la barra superior al bajar scroll
    initMobileMenu();      // Menú desplegable para teléfonos (hamburguesa)
    initActiveLinkObserver(); // Detector de qué sección está visible en pantalla
    initExercisesTabs();   // Pestañas interactivas de la sección Ejercicios
});

/* ==========================================================================
   1. CANVAS DE PARTÍCULAS DINÁMICAS (Efecto del fondo marino)
   ========================================================================== */
function initCanvasParticles() {
    // Buscamos el elemento <canvas> del documento por su ID
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return; // Si la página actual no tiene canvas, cancelamos la función
    
    // Obtenemos el contexto en 2D que nos permite dibujar formas directamente en el lienzo
    const ctx = canvas.getContext('2d');
    let particlesArray = []; // Aquí guardaremos todos los puntos creados
    let animationId; // Variable para controlar el bucle de la animación
    
    // Guardamos la posición del mouse del usuario para interactuar con las partículas
    const mouse = {
        x: null,
        y: null,
        radius: 120 // Distancia (en píxeles) a la que el mouse empezará a empujar las partículas
    };
    
    // Ajustamos el tamaño del canvas para que ocupe todo el ancho y alto del navegador
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Si el usuario cambia el tamaño de la ventana (redimensionar), volvemos a ajustar el canvas
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles(); // Recrea las partículas para la nueva resolución
    });
    
    // Guardamos las coordenadas del mouse cada vez que se mueve sobre la pantalla
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    
    // Si el mouse sale de la ventana del navegador, borramos las coordenadas
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Definimos una clase (molde) 'Particle' para crear y controlar cada punto de luz flotante
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; // Posición actual en el eje X (horizontal)
            this.y = y; // Posición actual en el eje Y (vertical)
            this.directionX = directionX; // Velocidad y dirección en el eje X
            this.directionY = directionY; // Velocidad y dirección en el eje Y
            this.size = size; // Tamaño del radio del punto
            this.color = color; // Color de la partícula
            this.originalX = x; // Posición original en X (por si debe regresar tras ser empujada)
            this.originalY = y; // Posición original en Y
        }
        
        // Método para pintar la partícula en el lienzo (canvas)
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        update() {
            // Comprobar colisión de ratón (efecto magnético / repulsión)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                // Fuerza máxima
                const maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                
                if (distance < mouse.radius) {
                    let directionX = forceDirectionX * force * 4;
                    let directionY = forceDirectionY * force * 4;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Volver lentamente a su posición original
                    if (this.x !== this.originalX) {
                        let dxOrig = this.x - this.originalX;
                        this.x -= dxOrig/20;
                    }
                    if (this.y !== this.originalY) {
                        let dyOrig = this.y - this.originalY;
                        this.y -= dyOrig/20;
                    }
                }
            } else {
                // Movimiento normal sutil en el fondo
                this.x += this.directionX * 0.2;
                this.y += this.directionY * 0.2;
                
                // Rebotar o envolver pantalla
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            }
            
            this.draw();
        }
    }
    
    // Inicializar array de partículas
    function initParticles() {
        particlesArray = [];
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
        
        const colors = [
            'rgba(0, 119, 182, 0.15)',   // Azul océano
            'rgba(0, 180, 216, 0.15)',   // Cian marino
            'rgba(144, 224, 239, 0.15)'  // Azul hielo
        ];
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * (innerWidth - size * 2) + size * 2);
            let y = (Math.random() * (innerHeight - size * 2) + size * 2);
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            let color = colors[Math.floor(Math.random() * colors.length)];
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }
    
    // Conectar partículas cercanas con líneas
    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    opacityValue = 1 - (distance / 120);
                    ctx.strokeStyle = `rgba(0, 180, 216, ${opacityValue * 0.04})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Bucle de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }
    
    resizeCanvas();
    initParticles();
    animate();
}

/* ==========================================================================
   2. NAVBAR - EFECTO SCROLL
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   3. MENÚ MÓVIL RESPONSIVO
   ========================================================================== */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger || !navMenu) return;
    
    // Abrir/Cerrar menú al hacer clic en el botón hamburguesa
    hamburger.addEventListener('click', () => {
        // Alternamos las clases visuales 'active'
        const isOpen = hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden'); // Evita hacer scroll de fondo con el menú abierto
        
        // ACCESIBILIDAD: Actualizamos el estado 'aria-expanded' para que los lectores de pantalla
        // informen al usuario ciego si el panel del menú está expandido o colapsado.
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        
        // También actualizamos la etiqueta explicativa (aria-label) dinámicamente.
        hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });
    
    // Cerrar el menú al hacer clic fuera de los enlaces (en el fondo del menú)
    navMenu.addEventListener('click', (event) => {
        if (event.target === navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú de navegación');
        }
    });

    // Cerramos el menú de forma automática si el usuario hace clic en algún enlace del menú
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
            
            // Restablecemos los atributos de accesibilidad al estado cerrado original
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú de navegación');
        });
    });
}

/* ==========================================================================
   4. OBSERVER PARA ENLACES DE NAVEGACIÓN ACTIVOS
   ========================================================================== */
function initActiveLinkObserver() {
    const sections = document.querySelectorAll('header, section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const options = {
        root: null,
        threshold: 0.35, // Activa cuando el 35% de la sección es visible
        rootMargin: '-50px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

/* ==========================================================================
   5. PESTAÑAS (TABS) INTERACTIVAS EN EJERCICIOS
   ========================================================================== */
function initExercisesTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0 || tabContents.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            
            // 1. Quitar estado activo de todos los botones y activarlo en el pulsado
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 2. Ocultar todos los contenidos de pestaña y mostrar el seleccionado
            tabContents.forEach(content => {
                content.classList.remove('active');
                
                // OPTIMIZACIÓN: Pausar/recargar iframes no visibles para ahorrar memoria y CPU
                const iframe = content.querySelector('iframe');
                if (iframe) {
                    // Si el iframe tiene un src, lo volvemos a asignar al seleccionarlo para asegurar carga fresca
                    const originalSrc = iframe.getAttribute('src');
                    if (content.getAttribute('id') === targetId) {
                        iframe.setAttribute('src', originalSrc); 
                    }
                }
            });
            
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}


