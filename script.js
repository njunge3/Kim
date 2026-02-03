// Three.js Scene Setup
let scene, camera, renderer, particles, particlesMesh;
let mouseX = 0, mouseY = 0;
let scrollY = 0;

function init() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Create Particles
    createParticles();
    
    // Create Geometric Shapes
    createGeometry();
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);
    
    // Navigation dots
    setupNavigation();
    
    // Animate
    animate();
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
}

function createGeometry() {
    // Rotating Cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
    const cubeMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const cube = new THREE.LineSegments(cubeEdges, cubeMaterial);
    cube.position.set(-3, 2, -2);
    scene.add(cube);
    cube.userData = { type: 'cube' };
    
    // Torus
    const torusGeometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
    const torusEdges = new THREE.EdgesGeometry(torusGeometry);
    const torusMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const torus = new THREE.LineSegments(torusEdges, torusMaterial);
    torus.position.set(3, -2, -3);
    scene.add(torus);
    torus.userData = { type: 'torus' };
    
    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
    const sphereMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.LineSegments(sphereEdges, sphereMaterial);
    sphere.position.set(2, 3, -4);
    scene.add(sphere);
    sphere.userData = { type: 'sphere' };
    
    // Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(0.8);
    const octaEdges = new THREE.EdgesGeometry(octaGeometry);
    const octaMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const octa = new THREE.LineSegments(octaEdges, octaMaterial);
    octa.position.set(-2, -3, -3);
    scene.add(octa);
    octa.userData = { type: 'octa' };
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    if(particlesMesh) {
        particlesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0003;
    }
    
    // Animate geometric shapes
    scene.children.forEach(child => {
        if(child.userData.type === 'cube') {
            child.rotation.x += 0.005;
            child.rotation.y += 0.005;
        }
        if(child.userData.type === 'torus') {
            child.rotation.x += 0.003;
            child.rotation.y += 0.007;
        }
        if(child.userData.type === 'sphere') {
            child.rotation.y += 0.004;
        }
        if(child.userData.type === 'octa') {
            child.rotation.x += 0.006;
            child.rotation.z += 0.004;
        }
    });
    
    // Mouse parallax effect
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Scroll effect
    camera.position.y = scrollY * 0.002;
    camera.position.z = 5 + scrollY * 0.001;
    
    renderer.render(scene, camera);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

function onScroll() {
    scrollY = window.scrollY;
    updateActiveSection();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupNavigation() {
    const dots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('section');
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const sectionIndex = parseInt(dot.getAttribute('data-section'));
            sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section');
    const dots = document.querySelectorAll('.nav-dot');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            dots.forEach(dot => dot.classList.remove('active'));
            if(dots[index]) dots[index].classList.add('active');
        }
    });
    
    // Hide scroll indicator after first section
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if(scrollIndicator) {
        if(window.scrollY > window.innerHeight * 0.5) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '0.5';
        }
    }
}

// PROJECT PAGES FUNCTIONALITY
function createProjectPages() {
    const container = document.getElementById('project-pages-container');
    
    Object.keys(projectsData).forEach(categoryKey => {
        const category = projectsData[categoryKey];
        const projectPage = document.createElement('div');
        projectPage.className = 'project-page';
        projectPage.id = `page-${categoryKey}`;
        
        // Header
        const header = `
            <div class="project-header">
                <button class="back-btn" onclick="closeProjectPage('${categoryKey}')">← BACK</button>
                <div class="project-category-title">${category.title}</div>
                <div class="project-counter"><span id="counter-${categoryKey}">1</span>/${category.projects.length}</div>
            </div>
        `;
        
        // Projects scroll container
        let projectsHTML = '<div class="project-scroll-container" id="scroll-' + categoryKey + '">';
        projectsHTML += '<div class="project-cards-wrapper">';
        
        category.projects.forEach((project, index) => {
            const linkHTML = project.link 
                ? `<a href="${project.link}" target="_blank" class="project-link">VIEW PROJECT</a>`
                : `<div class="project-link disabled">IN PRODUCTION</div>`;
            
            projectsHTML += `
                <div class="project-card" data-index="${index}">
                    <div class="project-card-number">${String(index + 1).padStart(2, '0')}</div>
                    <div class="project-card-title">${project.title}</div>
                    <div class="project-card-desc">${project.description}</div>
                    <div class="project-tags">
                        ${project.tech.map(tech => `<span class="project-tag">${tech}</span>`).join('')}
                    </div>
                    ${linkHTML}
                </div>
            `;
        });
        
        projectsHTML += '</div></div>';
        
        // Scroll hint
        const scrollHint = '<div class="scroll-hint">← DRAG TO SCROLL →</div>';
        
        projectPage.innerHTML = header + projectsHTML + scrollHint;
        container.appendChild(projectPage);
        
        // Add scroll listener for counter update
        const scrollContainer = projectPage.querySelector('.project-scroll-container');
        scrollContainer.addEventListener('scroll', () => updateProjectCounter(categoryKey, scrollContainer));
    });
}

function updateProjectCounter(categoryKey, scrollContainer) {
    const cards = scrollContainer.querySelectorAll('.project-card');
    const scrollLeft = scrollContainer.scrollLeft;
    const containerWidth = scrollContainer.offsetWidth;
    
    cards.forEach((card, index) => {
        const cardLeft = card.offsetLeft - scrollContainer.offsetLeft;
        const cardCenter = cardLeft + (card.offsetWidth / 2);
        const viewportCenter = scrollLeft + (containerWidth / 2);
        
        if (Math.abs(cardCenter - viewportCenter) < card.offsetWidth / 2) {
            const counter = document.getElementById(`counter-${categoryKey}`);
            if(counter) counter.textContent = index + 1;
        }
    });
}

function openProjectPage(categoryKey) {
    const page = document.getElementById(`page-${categoryKey}`);
    const transition = document.querySelector('.page-transition');
    
    // Page transition effect
    transition.classList.add('active');
    
    setTimeout(() => {
        // Hide main content
        document.querySelector('.content').style.display = 'none';
        document.querySelector('.nav-dots').style.display = 'none';
        document.querySelector('.scroll-indicator').style.display = 'none';
        
        // Show project page
        page.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Remove transition
        transition.classList.remove('active');
    }, 500);
}

function closeProjectPage(categoryKey) {
    const page = document.getElementById(`page-${categoryKey}`);
    const transition = document.querySelector('.page-transition');
    
    // Page transition effect
    transition.classList.add('active');
    
    setTimeout(() => {
        // Hide project page
        page.classList.remove('active');
        document.body.style.overflow = '';
        
        // Show main content
        document.querySelector('.content').style.display = 'block';
        document.querySelector('.nav-dots').style.display = 'flex';
        document.querySelector('.scroll-indicator').style.display = 'block';
        
        // Remove transition
        setTimeout(() => {
            transition.classList.remove('active');
        }, 100);
    }, 500);
}

// CATEGORY CARD CLICK HANDLERS
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            openProjectPage(category);
        });
        
        // Hover effect on shapes
        card.addEventListener('mouseenter', () => {
            scene.children.forEach(child => {
                if(child.userData.type) {
                    child.rotation.x += Math.random() * 0.1 - 0.05;
                    child.rotation.y += Math.random() * 0.1 - 0.05;
                }
            });
        });
    });
}

// SKILL INTERACTIONS
function setupSkillInteractions() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if(particlesMesh) {
                particlesMesh.rotation.x += 0.1;
                particlesMesh.rotation.y += 0.1;
            }
        });
    });
}

// CONTACT FORM HANDLER
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    
    if(!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
        submitBtn.style.opacity = '0.5';
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    message: message
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                formStatus.textContent = 'MESSAGE SENT SUCCESSFULLY';
                formStatus.classList.add('visible');
                formStatus.style.color = '#fff';
                contactForm.reset();
                
                setTimeout(() => {
                    formStatus.classList.remove('visible');
                }, 5000);
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            formStatus.textContent = 'FAILED TO SEND. TRY AGAIN.';
            formStatus.classList.add('visible');
            formStatus.style.color = '#ff4444';
            
            setTimeout(() => {
                formStatus.classList.remove('visible');
            }, 5000);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SEND';
            submitBtn.style.opacity = '1';
        }
    });
}

// KEYBOARD NAVIGATION
function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const sections = document.querySelectorAll('section');
        const currentSection = Array.from(sections).findIndex(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
        });
        
        if(e.key === 'ArrowDown' && currentSection < sections.length - 1) {
            e.preventDefault();
            sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
        } else if(e.key === 'ArrowUp' && currentSection > 0) {
            e.preventDefault();
            sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
        }
        
        // ESC to close project pages
        if(e.key === 'Escape') {
            const activePage = document.querySelector('.project-page.active');
            if(activePage) {
                const categoryKey = activePage.id.replace('page-', '');
                closeProjectPage(categoryKey);
            }
        }
    });
}

// INITIALIZATION
window.addEventListener('load', () => {
    init();
    createProjectPages();
    setupCategoryCards();
    setupSkillInteractions();
    setupContactForm();
    setupKeyboardNav();
    
    // Loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// PERFORMANCE OPTIMIZATION
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        renderer.setAnimationLoop(null);
    } else {
        renderer.setAnimationLoop(animate);
    }
});
