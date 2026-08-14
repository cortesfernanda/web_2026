/* ==========================================================================
   LÓGICA E INTERACTIVIDAD
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todas las funcionalidades activas
    initCanvasParticles();
    initNavbarScroll();
    initMobileMenu();
    initActiveLinkObserver();
});

/* ==========================================================================
   1. CANVAS DE PARTÍCULAS DINÁMICAS (FONDO)
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationId;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };
    
    // Ajustar tamaño del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Clase Partícula
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.originalX = x;
            this.originalY = y;
        }
        
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
    
    // Toggle menú
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    });
    
    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
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
