/* ==========================================================================
   ILUSTRE MUNICIPALIDAD DE PUTAENDO — INTERACTIVIDAD (JavaScript)
   Diseño Desde el Código 2026 | Arquitectura e[ad] PUCV
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavigationDropdowns();
    initHeroSlider();
    initSiteSearch();
    initMobileNav();
    initNewsMonthFilter();
    initScrollToTopButton();
});

/* ==========================================================================
   1. MENÚS DESPLEGABLES (DROPDOWNS) FLUIDOS Y SIN SOLAPAMIENTOS
   ========================================================================== */
function initNavigationDropdowns() {
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

    function closeAllDropdowns() {
        dropdownItems.forEach((item) => {
            item.classList.remove('is-open');
            const btn = item.querySelector('.nav-btn-link');
            if (btn) {
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    dropdownItems.forEach((item) => {
        const btn = item.querySelector('.nav-btn-link');
        const menu = item.querySelector('.dropdown-menu');

        if (!btn || !menu) return;

        // Click en el boton de navegacion: abre y cierra fluidamente al presionar tanto en movil como en escritorio
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = item.classList.contains('is-open');
            closeAllDropdowns();
            if (!isOpen) {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });

        // En escritorio: al entrar a otro elemento, cerrar los demas para evitar solapamientos
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                dropdownItems.forEach((other) => {
                    if (other !== item && other.classList.contains('is-open')) {
                        other.classList.remove('is-open');
                        const otherBtn = other.querySelector('.nav-btn-link');
                        if (otherBtn) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });

        // En escritorio: al salir el mouse del boton y del menu desplegable, cerrar
        item.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                item.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Cerrar menus al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.has-dropdown')) {
            closeAllDropdowns();
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });
}

/* ==========================================================================
   2. CARRUSEL HERO DE PANTALLA COMPLETA (FULL-WIDTH)
   ========================================================================== */
function initHeroSlider() {
    const slider = document.getElementById('hero-slider');
    const slides = document.querySelectorAll('.slide-item');
    const dots = document.querySelectorAll('.dot-btn');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    if (!slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;
    const AUTOPLAY_INTERVAL = 6000; // 6 segundos

    // Función para mostrar una diapositiva específica
    function showSlide(index) {
        // Asegurar límites circulares
        if (index >= totalSlides) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = index;
        }

        // Actualizar diapositivas
        slides.forEach((slide, i) => {
            const isActive = i === currentIndex;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', (!isActive).toString());
            if (isActive) {
                slide.setAttribute('aria-current', 'true');
            } else {
                slide.removeAttribute('aria-current');
            }
        });

        // Actualizar dots
        dots.forEach((dot, i) => {
            const isActive = i === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive.toString());
        });
    }

    // Avanzar a la siguiente diapositiva
    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    // Retroceder a la diapositiva anterior
    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    // Iniciar temporizador automático
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    }

    // Detener temporizador
    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    // Eventos de botones
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoplay();
        });
    }

    // Eventos de los dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            showSlide(i);
            startAutoplay();
        });
    });

    // Pausar rotación automática al pasar el mouse por encima
    if (slider) {
        slider.addEventListener('mouseenter', stopAutoplay);
        slider.addEventListener('mouseleave', startAutoplay);

        // Soporte de navegación táctil (Swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoplay();
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diffX = touchStartX - touchEndX;

            if (Math.abs(diffX) > 40) {
                if (diffX > 0) {
                    nextSlide(); // Deslizar izquierda -> siguiente
                } else {
                    prevSlide(); // Deslizar derecha -> anterior
                }
            }
            startAutoplay();
        }, { passive: true });
    }

    // Soporte teclado (flechas izquierda/derecha cuando el slider está enfocado)
    slider?.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
            startAutoplay();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
            startAutoplay();
        }
    });

    // Iniciar autoplay
    startAutoplay();
}

/* ==========================================================================
   3. BÚSQUEDA RÁPIDA INTERACTIVA
   ========================================================================== */
function initSiteSearch() {
    const searchInput = document.getElementById('site-search');
    const resultsContainer = document.getElementById('search-results-dropdown');
    if (!searchInput || !resultsContainer) return;

    // Catálogo de búsqueda indexado del sitio de Putaendo
    const searchCatalog = [
        {
            title: 'Autoridades Comunales (Alcalde y Concejo Municipal)',
            type: 'Municipio',
            link: 'autoridades.html',
            keywords: 'autoridades alcalde mauricio quiroz concejo concejales municipio concejala francisco casas marta silva sebastian caldera miguel ortiz carlos gallardo mariana bravo'
        },
        {
            title: 'Permiso de Circulación 2026',
            type: 'Trámite en Línea',
            link: '#tramite-permiso',
            keywords: 'permiso circulacion auto patente vehiculo pago cuota multas'
        },
        {
            title: 'Solicitud de Audiencias (Ley del Lobby)',
            type: 'Atención Ciudadana',
            link: '#tramite-audiencias',
            keywords: 'audiencia alcalde concejales lobby ley cita reunion'
        },
        {
            title: 'Portal de Servicios & Certificados',
            type: 'Ventanilla Municipal',
            link: '#tramite-servicios',
            keywords: 'servicios certificados residencia patentes obras comerciales ficha social'
        },
        {
            title: 'Comunidad recibe posters de biodiversidad cordillerana',
            type: 'Noticia Comunal',
            link: '#noticia-1',
            keywords: 'posters biodiversidad cordillera fauna flora ecosistema colegios'
        },
        {
            title: 'Red Local de Solidaridad',
            type: 'Desarrollo Comunitario',
            link: '#noticia-2',
            keywords: 'solidaridad ayuda voluntariado adultos mayores familias rural'
        },
        {
            title: 'Rutas patrimoniales: Primer Pueblo Libre de Chile',
            type: 'Turismo & Cultura',
            link: '#noticia-3',
            keywords: 'patrimonio historia calle comercio rutas turismo pueblo libre'
        },
        {
            title: 'Portal de Transparencia Activa',
            type: 'Gobierno Abierto',
            link: 'https://www.portaltransparencia.cl',
            keywords: 'transparencia sueldos contrataciones gastos decretos balance'
        }
    ];

    function renderResults(query) {
        const cleanQuery = query.toLowerCase().trim();
        if (cleanQuery.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('is-open');
            return;
        }

        const matches = searchCatalog.filter(item => {
            return item.title.toLowerCase().includes(cleanQuery) ||
                   item.keywords.toLowerCase().includes(cleanQuery) ||
                   item.type.toLowerCase().includes(cleanQuery);
        });

        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item" style="color: #64748b; font-style: italic;">
                    No se encontraron resultados para "${query}"
                </div>
            `;
        } else {
            resultsContainer.innerHTML = matches.map(m => `
                <a href="${m.link}" class="search-result-item">
                    <div class="search-result-type">${m.type}</div>
                    <strong>${m.title}</strong>
                </a>
            `).join('');
        }

        resultsContainer.classList.add('is-open');
    }

    searchInput.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            resultsContainer.classList.remove('is-open');
        }
    });

    // Función global para cuando envían el formulario
    window.ejecutarBusqueda = function() {
        const val = searchInput.value.trim();
        if (val) {
            renderResults(val);
        }
    };
}

/* ==========================================================================
   4. MENÚ MÓVIL (DRAWER RESPONSIVE)
   ========================================================================== */
function initMobileNav() {
    const mobileBtn = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');

    if (!mobileBtn || !mainNav) return;

    mobileBtn.addEventListener('click', () => {
        const isOpen = mainNav.classList.contains('is-open');
        if (isOpen) {
            mainNav.classList.remove('is-open');
            mobileBtn.classList.remove('is-active');
            mobileBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        } else {
            mainNav.classList.add('is-open');
            mobileBtn.classList.add('is-active');
            mobileBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
    });

    // Cerrar al hacer click en un enlace interno
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('is-open');
                mobileBtn.classList.remove('is-active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });
}

/* ==========================================================================
   5. NAVEGADOR DE MESES EN EL PORTAL DE NOTICIAS (noticias.html)
   ========================================================================== */
function initNewsMonthFilter() {
    const prevBtn = document.getElementById('month-prev-btn');
    const nextBtn = document.getElementById('month-next-btn');
    const label = document.getElementById('current-month-label');
    const cards = document.querySelectorAll('.news-portal-card');

    if (!prevBtn || !nextBtn || !label) return;

    // Listado de meses disponibles según maqueta
    const months = [
        { label: 'SEPTIEMBRE 2026', code: '09-2026' },
        { label: 'JULIO 2026', code: '07-2026' },
        { label: 'MAYO 2026', code: '05-2026' },
        { label: 'TODAS LAS NOTICIAS', code: 'todos' }
    ];

    let currentIndex = 0; // Inicia en SEPTIEMBRE 2026 como en la foto

    function updateMonthDisplay() {
        const current = months[currentIndex];
        label.textContent = current.label;

        // Filtrar tarjetas según el mes seleccionado
        cards.forEach((card) => {
            const cardMonth = card.getAttribute('data-month');
            if (current.code === 'todos' || cardMonth === current.code) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Botón mes anterior
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + months.length) % months.length;
        updateMonthDisplay();
    });

    // Botón mes siguiente
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % months.length;
        updateMonthDisplay();
    });

    // Inicializar visualización de septiembre
    updateMonthDisplay();
}


/* ==========================================================================
   6. PORTAL DE TURISMO (turismo.html) - MODALES DE RUTAS Y MAPA
   ========================================================================== */

const tourismRoutesData = {
    'cruce-andes': {
        title: "Ruta Cruce del Ejército Los Andes",
        tag: "Circuito Histórico e Hitos de la Independencia",
        image: "assets/turismo/ruta-cruce-andes.png",
        desc: "Sigue la épica huella del Ejército Libertador del General José de San Martín y el Capitán General Bernardo O'Higgins, que en febrero de 1817 ingresó a territorio nacional por los pasos cordilleranos de Putaendo, proclamando a la comuna como el Primer Pueblo Libre de Chile.",
        hitos: [
            "<strong>Monumento al Combate de Las Coimas:</strong> Escenario del histórico combate donde la vanguardia patriota liderada por Mariano Necochea derrotó a las fuerzas realistas.",
            "<strong>Hito Histórico Achupallas:</strong> Sitio del primer choque de armas del Ejército Libertador en suelo chileno.",
            "<strong>Monolito Paso de Los Patos:</strong> Hito conmemorativo en honor a la División de vanguardia comandada por el General Estanislao Soler.",
            "<strong>Miradores Cordilleranos:</strong> Panorámica sobre el Valle de Los Patos y la majestuosa cordillera de Los Andes."
        ],
        tips: "Se recomienda iniciar el recorrido temprano, vestir ropa cómoda por capas adecuada para el clima cordillerano, usar bloqueador solar y llevar hidratación. Para visitas a sectores de alta cordillera se sugiere transporte 4x4 o guías turísticos locales."
    },
    'patrimonio-arquitectura': {
        title: "Ruta Patrimonio Arquitectónico",
        tag: "Zona Típica y Casco Colonial",
        image: "assets/turismo/ruta-arquitectura.png",
        desc: "Putaendo conserva uno de los conjuntos coloniales de mayor valor patrimonial de Chile central, con su trazado colonial y edificaciones continuas de adobe declaradas Monumento Nacional en la categoría de Zona Típica.",
        hitos: [
            "<strong>Calle Comercio:</strong> Arteria principal con su pavimento original de piedras de río (cantos rodados), veredas altas y casas coloniales del siglo XVIII y XIX.",
            "<strong>Parroquia San Antonio de Padua:</strong> Monumental templo frente a la Plaza Prat, fundado originalmente en la época colonial y reconstruido a fines del siglo XIX.",
            "<strong>Plaza de Armas Prat:</strong> Espacio cívico tradicional con frondosos árboles centenarios y quiosco de música de época.",
            "<strong>Zaguanes y Patios Interiores:</strong> Arquitectura tradicional con galerías de pilares de roble y techumbres de teja de arcilla cocida."
        ],
        tips: "Ideal para realizar a pie en un recorrido peatonal pausado de 2 a 3 horas. No olvides tu cámara fotográfica. Durante la mañana y al atardecer las fachadas coloniales adquieren una tonalidad cálida ideal para la fotografía."
    },
    'cultural': {
        title: "Ruta Cultural",
        tag: "Tradiciones, Artesanía y Expresiones Vivas",
        image: "assets/turismo/ruta-cultural.png",
        desc: "Descubre las profundas raíces de la identidad campesina y artística de Putaendo, cuna de cantores a lo humano y lo divino, artesanos del barro y la madera, y cultores del patrimonio inmaterial.",
        hitos: [
            "<strong>Centro Cultural Bernardo Parra:</strong> Epicentro del arte y la memoria local con salas de exhibición, pinacoteca y biblioteca comunal.",
            "<strong>Ruta de los Artesanos en Rinconada de Silva:</strong> Talleres familiares donde se elaboran tradicionales vasijas de greda y tallados en madera nativa.",
            "<strong>Museo Histórico Comunal:</strong> Colección de objetos históricos, aperos huasos antiguos y testimonios de la minería histórica.",
            "<strong>Eventos y Fiestas Campesinas:</strong> Encuentros de payadores, la Fiesta de la Chilenidad y ferias de gastronomía típica."
        ],
        tips: "Puedes adquirir artesanías auténticas directamente con las familias alfareras. Consulta en la Oficina de Turismo sobre las fechas del Festival del Verano y ferias costumbristas."
    },
    'religiosa': {
        title: "Ruta Religiosa",
        tag: "Devoción, Santuarios y Fe Popular",
        image: "assets/turismo/ruta-religiosa.png",
        desc: "Un circuito espiritual que fusiona la devoción popular andina, la tradición de los Bailes Chinos (Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO) y la arquitectura sacra del valle.",
        hitos: [
            "<strong>Santuario del Cristo de Madera (Rinconada de Silva):</strong> Majestuosa escultura de Cristo de más de 4 metros de altura tallada en madera de canelo por el artista Peter Horn, ubicada en un mirador natural del cerro.",
            "<strong>Capilla de Guzmanes:</strong> Histórico oratorio colonial de adobe rodeado de campos agrícolas y antiguas haciendas.",
            "<strong>Parroquia San Antonio de Padua:</strong> Sede de la devoción al patrono comunal.",
            "<strong>Gruta y Vía Crucis del Cerro de Rinconada:</strong> Sendero de recogimiento y oración con vistas panorámicas hacia todo el valle de Putaendo."
        ],
        tips: "El ascenso al Santuario del Cristo de Madera cuenta con escalinatas y estación de descanso. Se recomienda calzado con buen agarre. En Semana Santa y durante la Fiesta Patronal el santuario congrega a miles de peregrinos."
    }
};

window.abrirModalRuta = function(routeKey) {
    const data = tourismRoutesData[routeKey];
    if (!data) return;

    const modal = document.getElementById('modal-ruta');
    const titleEl = document.getElementById('modal-ruta-title');
    const descEl = document.getElementById('modal-ruta-desc');
    const imgEl = document.getElementById('modal-ruta-img');
    const tagEl = document.getElementById('modal-ruta-tag');
    const hitosEl = document.getElementById('modal-ruta-hitos');
    const tipsEl = document.getElementById('modal-ruta-tips');

    if (!modal) return;

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (imgEl) {
        imgEl.src = data.image;
        imgEl.alt = data.title;
    }
    if (tagEl) tagEl.textContent = data.tag;
    if (tipsEl) tipsEl.textContent = data.tips;

    if (hitosEl) {
        hitosEl.innerHTML = '';
        data.hitos.forEach(hito => {
            const li = document.createElement('li');
            li.innerHTML = hito;
            hitosEl.appendChild(li);
        });
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.cerrarModalRuta = function() {
    const modal = document.getElementById('modal-ruta');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.abrirModalMapa = function() {
    const modal = document.getElementById('modal-mapa');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.cerrarModalMapa = function() {
    const modal = document.getElementById('modal-mapa');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

// Cerrar modales con tecla Escape y click en el backdrop oscuro
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.cerrarModalRuta();
        window.cerrarModalMapa();
        if (window.cerrarModalPagoTramite) window.cerrarModalPagoTramite();
    }
});

document.addEventListener('click', (e) => {
    const modalRuta = document.getElementById('modal-ruta');
    const modalMapa = document.getElementById('modal-mapa');

    if (modalRuta && e.target === modalRuta) {
        window.cerrarModalRuta();
    }
    if (modalMapa && e.target === modalMapa) {
        window.cerrarModalMapa();
    }
    const modalTramite = document.getElementById('modal-pago-tramite');
    if (modalTramite && e.target === modalTramite) {
        window.cerrarModalPagoTramite();
    }
});

/* ==========================================================================
   7. BOTON FLOTANTE "SUBIR DEL TODO" (LADO IZQUIERDO)
   ========================================================================== */
function initScrollToTopButton() {
    let btn = document.getElementById('scroll-to-top-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'scroll-to-top-btn';
        btn.className = 'scroll-to-top-btn';
        btn.setAttribute('aria-label', 'Subir del todo');
        btn.setAttribute('title', 'Subir del todo');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(btn);
    }

    function checkScroll() {
        if (window.scrollY > 160) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


/* ==========================================================================
   8. MODAL INTERACTIVO DE TRAMITES Y PAGOS EN LINEA
   ========================================================================== */
window.abrirModalPagoTramite = function(nombreTramite) {
    const modal = document.getElementById('modal-pago-tramite');
    if (!modal) return;
    const title = document.getElementById('modal-tramite-title');
    if (title && nombreTramite) {
        title.textContent = 'Pago en L\u00ednea: ' + nombreTramite;
    }
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
};

window.cerrarModalPagoTramite = function() {
    const modal = document.getElementById('modal-pago-tramite');
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
};

window.simularConsultaTramite = function(e) {
    e.preventDefault();
    const inputPatente = document.getElementById('tramite-input-patente');
    const valor = inputPatente ? inputPatente.value.trim().toUpperCase() : '';
    const feedback = document.getElementById('tramite-feedback-box');
    
    if (!valor) {
        if (feedback) {
            feedback.innerHTML = '<div style="color: #dc2626; font-size: 14px; font-weight: 700; margin-top: 10px;">&#x26A0;&#xFE0F; Por favor ingresa una patente o RUT para consultar.</div>';
        }
        return;
    }

    if (feedback) {
        feedback.innerHTML = '<div style="background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 14px; border-radius: 8px; font-size: 14px; margin-top: 14px; line-height: 1.6;"><strong>&#x2705; Veh&iacute;culo identificado (' + valor + ')</strong><br>Estado: Habilitado para pago Permiso de Circulaci&oacute;n 2026.<br>Monto total: $58.420 (o 2 cuotas de $29.210).<br><br><a href="#" onclick="alert(\'Simulaci&oacute;n de pasarela: Pago procesado exitosamente por Tesorer&iacute;a General / Banco Estado.\'); return false;" class="btn-tramite-action" style="padding: 10px 20px; font-size: 14px !important; display: inline-block; margin-top: 8px;">Pagar con Webpay Plus</a></div>';
    }
};
