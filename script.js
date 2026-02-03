// Three.js Scene Setup with Star Wars Crawl Effect
let scene, camera, renderer, particles, particlesMesh;
let mouseX = 0, mouseY = 0;
let scrollY = 0;

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    
    // Camera - Positioned for Star Wars perspective
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 10);
    camera.rotation.x = -0.3; // Slight upward tilt for crawl effect
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Create 3D Star Field
    createStarField();
    
    // Create Shooting Stars
    createShootingStars();
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Distant blue light
    const blueLight = new THREE.PointLight(0x4444ff, 0.5);
    blueLight.position.set(-20, 5, -30);
    scene.add(blueLight);
    
    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);
    
    // Navigation dots
    setupNavigation();
    
    // Animate
    animate();
}

// ENHANCED STAR FIELD - 3D Floating Stars
function createStarField() {
    // MAIN STAR FIELD - Deep space stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsSizes = new Float32Array(starsCount);
    const starsColors = new Float32Array(starsCount * 3);
    
    for(let i = 0; i < starsCount; i++) {
        // Create a cylindrical distribution (Star Wars tunnel effect)
        const radius = Math.random() * 50 + 10;
        const angle = Math.random() * Math.PI * 2;
        const depth = Math.random() * 200 - 100;
        
        starsPositions[i * 3] = Math.cos(angle) * radius;
        starsPositions[i * 3 + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
        starsPositions[i * 3 + 2] = depth;
        
        // Random star sizes for depth perception
        starsSizes[i] = Math.random() * 3 + 0.5;
        
        // Slight color variation (white to light blue)
        const colorIntensity = 0.8 + Math.random() * 0.2;
        starsColors[i * 3] = colorIntensity;
        starsColors[i * 3 + 1] = colorIntensity;
        starsColors[i * 3 + 2] = 1.0;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });
    
    particlesMesh = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(particlesMesh);
    
    // CLOSE FLOATING STARS - More prominent individual stars
    const floatingStarsGeometry = new THREE.BufferGeometry();
    const floatingCount = 200;
    const floatingPositions = new Float32Array(floatingCount * 3);
    const floatingSizes = new Float32Array(floatingCount);
    
    for(let i = 0; i < floatingCount; i++) {
        floatingPositions[i * 3] = (Math.random() - 0.5) * 80;
        floatingPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
        floatingPositions[i * 3 + 2] = Math.random() * 60 - 30;
        
        floatingSizes[i] = Math.random() * 2 + 1;
    }
    
    floatingStarsGeometry.setAttribute('position', new THREE.BufferAttribute(floatingPositions, 3));
    floatingStarsGeometry.setAttribute('size', new THREE.BufferAttribute(floatingSizes, 1));
    
    const floatingStarsMaterial = new THREE.PointsMaterial({
        size: 0.3,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: createStarTexture(),
        depthWrite: false
    });
    
    const floatingStars = new THREE.Points(floatingStarsGeometry, floatingStarsMaterial);
    floatingStars.userData = { type: 'floatingStars', velocities: [] };
    
    // Give each star a unique floating velocity
    for(let i = 0; i < floatingCount; i++) {
        floatingStars.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002
        });
    }
    
    scene.add(floatingStars);
    
    // DISTANT NEBULA - Colorful background
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = 800;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);
    
    for(let i = 0; i < nebulaCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 40 + 30;
        nebulaPositions[i * 3] = Math.cos(angle) * radius;
        nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        nebulaPositions[i * 3 + 2] = Math.sin(angle) * radius - 80;
        
        // Purple/pink nebula colors
        nebulaColors[i * 3] = 0.6 + Math.random() * 0.4;     // R
        nebulaColors[i * 3 + 1] = 0.2 + Math.random() * 0.3; // G
        nebulaColors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
    }
    
    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
    
    const nebulaMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    nebula.userData = { type: 'nebula' };
    scene.add(nebula);
}

// Create a circular star texture
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// SHOOTING STARS EFFECT
function createShootingStars() {
    const shootingStarCount = 8;
    
    for(let i = 0; i < shootingStarCount; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(60); // 20 points for trail
        
        for(let j = 0; j < 20; j++) {
            positions[j * 3] = 0;
            positions[j * 3 + 1] = 0;
            positions[j * 3 + 2] = -j * 0.8;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            linewidth: 2
        });
        
        const shootingStar = new THREE.Line(geometry, material);
        
        shootingStar.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            -Math.random() * 80 - 20
        );
        
        shootingStar.userData = {
            type: 'shootingStar',
            velocity: {
                x: Math.random() * 0.4 + 0.3,
                y: -(Math.random() * 0.3 + 0.2),
                z: Math.random() * 0.3 + 0.2
            },
            resetTime: Date.now() + Math.random() * 15000
        };
        
        scene.add(shootingStar);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // MAIN STAR FIELD - Star Wars crawl movement
    if(particlesMesh) {
        const positions = particlesMesh.geometry.attributes.position.array;
        
        for(let i = 0; i < positions.length; i += 3) {
            // Move stars towards camera (crawl effect)
            positions[i + 2] += 0.05;
            
            // Reset stars that pass the camera
            if(positions[i + 2] > 20) {
                positions[i + 2] = -100;
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 50 + 10;
                positions[i] = Math.cos(angle) * radius;
                positions[i + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
            }
        }
        
        particlesMesh.geometry.attributes.position.needsUpdate = true;
        
        // Subtle rotation for depth
        particlesMesh.rotation.z += 0.00005;
    }
    
    // Animate all space objects
    scene.children.forEach(child => {
        // FLOATING STARS - Gentle 3D movement
        if(child.userData.type === 'floatingStars') {
            const positions = child.geometry.attributes.position.array;
            const velocities = child.userData.velocities;
            
            for(let i = 0; i < positions.length; i += 3) {
                const index = i / 3;
                positions[i] += velocities[index].x;
                positions[i + 1] += velocities[index].y;
                positions[i + 2] += velocities[index].z;
                
                // Boundary check - wrap around
                if(Math.abs(positions[i]) > 40) velocities[index].x *= -1;
                if(Math.abs(positions[i + 1]) > 30) velocities[index].y *= -1;
                if(Math.abs(positions[i + 2]) > 30) velocities[index].z *= -1;
            }
            
            child.geometry.attributes.position.needsUpdate = true;
            
            // Gentle rotation
            child.rotation.y += 0.0001;
            child.rotation.x += 0.00005;
        }
        
        // SHOOTING STARS
        if(child.userData.type === 'shootingStar') {
            child.position.x += child.userData.velocity.x;
            child.position.y += child.userData.velocity.y;
            child.position.z += child.userData.velocity.z;
            
            if(Date.now() > child.userData.resetTime) {
                child.position.set(
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 60,
                    -Math.random() * 80 - 20
                );
                child.userData.resetTime = Date.now() + Math.random() * 15000 + 5000;
            }
            
            const age = (Date.now() - (child.userData.resetTime - 20000)) / 20000;
            child.material.opacity = Math.max(0, 0.9 - age);
        }
        
        // NEBULA - Gentle pulsing
        if(child.userData.type === 'nebula') {
            child.rotation.y += 0.0002;
            child.material.opacity = 0.12 + Math.sin(time * 0.5) * 0.05;
        }
    });
    
    // CAMERA MOVEMENT - Star Wars style
    // Mouse parallax (subtle)
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    
    // Scroll effect - fly through space
    const scrollProgress = scrollY * 0.005;
    
    // Forward movement through the star tunnel
    camera.position.z = 10 - scrollProgress * 0.8;
    
    // Maintain the upward tilt (Star Wars crawl angle)
    camera.rotation.x = -0.3 + Math.sin(scrollProgress * 0.05) * 0.05;
    
    // Slight banking/rolling effect when scrolling
    camera.rotation.z = Math.sin(scrollProgress * 0.08) * 0.03;
    
    // Look slightly ahead in the direction of travel
    const lookAtTarget = new THREE.Vector3(
        mouseX * 3,
        -5,
        -30
    );
    camera.lookAt(lookAtTarget);
    
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
        
        const header = `
            <div class="project-header">
                <button class="back-btn" onclick="closeProjectPage('${categoryKey}')">← BACK</button>
                <div class="project-category-title">${category.title}</div>
                <div class="project-counter"><span id="counter-${categoryKey}">1</span>/${category.projects.length}</div>
            </div>
        `;
        
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
        const scrollHint = '<div class="scroll-hint">← DRAG TO SCROLL →</div>';
        
        projectPage.innerHTML = header + projectsHTML + scrollHint;
        container.appendChild(projectPage);
        
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
    
    transition.classList.add('active');
    
    setTimeout(() => {
        document.querySelector('.content').style.display = 'none';
        document.querySelector('.nav-dots').style.display = 'none';
        document.querySelector('.scroll-indicator').style.display = 'none';
        
        page.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        transition.classList.remove('active');
    }, 500);
}

function closeProjectPage(categoryKey) {
    const page = document.getElementById(`page-${categoryKey}`);
    const transition = document.querySelector('.page-transition');
    
    transition.classList.add('active');
    
    setTimeout(() => {
        page.classList.remove('active');
        document.body.style.overflow = '';
        
        document.querySelector('.content').style.display = 'block';
        document.querySelector('.nav-dots').style.display = 'flex';
        document.querySelector('.scroll-indicator').style.display = 'block';
        
        setTimeout(() => {
            transition.classList.remove('active');
        }, 100);
    }, 500);
}

function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            openProjectPage(category);
        });
    });
}

function setupSkillInteractions() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if(particlesMesh) {
                particlesMesh.rotation.x += 0.05;
                particlesMesh.rotation.y += 0.05;
            }
        });
    });
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    
    if(!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
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






// The Second Type 3d Effect : Star wars Theme poor but docile


// // Three.js Scene Setup
// let scene, camera, renderer, particles, particlesMesh;
// let mouseX = 0, mouseY = 0;
// let scrollY = 0;

// function init() {
//     // Scene
//     scene = new THREE.Scene();
//     scene.fog = new THREE.FogExp2(0x000000, 0.001); // Add space fog for depth
    
//     // Camera
//     camera = new THREE.PerspectiveCamera(
//         75,
//         window.innerWidth / window.innerHeight,
//         0.1,
//         1000
//     );
//     camera.position.z = 5;
    
//     // Renderer
//     renderer = new THREE.WebGLRenderer({ 
//         alpha: true,
//         antialias: true 
//     });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     document.getElementById('canvas-container').appendChild(renderer.domElement);
    
//     // Create Star Field
//     createParticles();
    
//     // Create Space Objects (meteors, planets, etc)
//     createGeometry();
    
//     // Create Shooting Stars
//     createShootingStars();
    
//     // Lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
//     scene.add(ambientLight);
    
//     const pointLight = new THREE.PointLight(0xffffff, 0.8);
//     pointLight.position.set(10, 10, 10);
//     scene.add(pointLight);
    
//     // Distant blue light (like a distant star)
//     const blueLight = new THREE.PointLight(0x4444ff, 0.5);
//     blueLight.position.set(-20, 5, -30);
//     scene.add(blueLight);
    
//     // Event Listeners
//     window.addEventListener('resize', onWindowResize);
//     document.addEventListener('mousemove', onMouseMove);
//     window.addEventListener('scroll', onScroll);
    
//     // Navigation dots
//     setupNavigation();
    
//     // Animate
//     animate();
// }

// // SHOOTING STARS EFFECT
// function createShootingStars() {
//     const shootingStarCount = 5;
    
//     for(let i = 0; i < shootingStarCount; i++) {
//         const geometry = new THREE.BufferGeometry();
//         const positions = new Float32Array(30); // 10 points for trail
        
//         for(let j = 0; j < 10; j++) {
//             positions[j * 3] = 0;
//             positions[j * 3 + 1] = 0;
//             positions[j * 3 + 2] = -j * 0.5;
//         }
        
//         geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
//         const material = new THREE.LineBasicMaterial({
//             color: 0xffffff,
//             transparent: true,
//             opacity: 0.8,
//             blending: THREE.AdditiveBlending
//         });
        
//         const shootingStar = new THREE.Line(geometry, material);
        
//         shootingStar.position.set(
//             (Math.random() - 0.5) * 50,
//             (Math.random() - 0.5) * 50,
//             -Math.random() * 50 - 10
//         );
        
//         shootingStar.userData = {
//             type: 'shootingStar',
//             velocity: {
//                 x: Math.random() * 0.3 + 0.2,
//                 y: -(Math.random() * 0.2 + 0.1),
//                 z: Math.random() * 0.2 + 0.1
//             },
//             resetTime: Date.now() + Math.random() * 10000
//         };
        
//         scene.add(shootingStar);
//     }
// }

// function createParticles() {
//     // STAR FIELD - Multiple layers for depth
//     const starsGeometry = new THREE.BufferGeometry();
//     const starsCount = 3000;
//     const starsPositions = new Float32Array(starsCount * 3);
//     const starsSizes = new Float32Array(starsCount);
    
//     for(let i = 0; i < starsCount; i++) {
//         // Spread stars in a large volume
//         starsPositions[i * 3] = (Math.random() - 0.5) * 100;
//         starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
//         starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
//         // Random star sizes
//         starsSizes[i] = Math.random() * 2;
//     }
    
//     starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
//     starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1));
    
//     const starsMaterial = new THREE.PointsMaterial({
//         size: 0.1,
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.8,
//         blending: THREE.AdditiveBlending,
//         sizeAttenuation: true
//     });
    
//     particlesMesh = new THREE.Points(starsGeometry, starsMaterial);
//     scene.add(particlesMesh);
    
//     // DISTANT GALAXIES - Glowing points in far distance
//     const galaxiesGeometry = new THREE.BufferGeometry();
//     const galaxiesCount = 100;
//     const galaxiesPositions = new Float32Array(galaxiesCount * 3);
    
//     for(let i = 0; i < galaxiesCount; i++) {
//         galaxiesPositions[i * 3] = (Math.random() - 0.5) * 150;
//         galaxiesPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
//         galaxiesPositions[i * 3 + 2] = (Math.random() - 0.5) * 150 - 50;
//     }
    
//     galaxiesGeometry.setAttribute('position', new THREE.BufferAttribute(galaxiesPositions, 3));
    
//     const galaxiesMaterial = new THREE.PointsMaterial({
//         size: 0.5,
//         color: 0x8888ff,
//         transparent: true,
//         opacity: 0.3,
//         blending: THREE.AdditiveBlending
//     });
    
//     const galaxies = new THREE.Points(galaxiesGeometry, galaxiesMaterial);
//     galaxies.userData = { type: 'galaxies' };
//     scene.add(galaxies);
// }

// function createGeometry() {
//     // METEORS/ASTEROIDS - Flying rocks
//     const meteorCount = 15;
    
//     for(let i = 0; i < meteorCount; i++) {
//         const size = Math.random() * 0.5 + 0.2;
//         const meteorGeometry = new THREE.DodecahedronGeometry(size, 0);
//         const meteorEdges = new THREE.EdgesGeometry(meteorGeometry);
//         const meteorMaterial = new THREE.LineBasicMaterial({ 
//             color: 0xffffff,
//             transparent: true,
//             opacity: 0.4
//         });
//         const meteor = new THREE.LineSegments(meteorEdges, meteorMaterial);
        
//         // Random position in space
//         meteor.position.set(
//             (Math.random() - 0.5) * 40,
//             (Math.random() - 0.5) * 40,
//             (Math.random() - 0.5) * 40 - 10
//         );
        
//         // Random rotation
//         meteor.rotation.set(
//             Math.random() * Math.PI,
//             Math.random() * Math.PI,
//             Math.random() * Math.PI
//         );
        
//         meteor.userData = { 
//             type: 'meteor',
//             velocity: {
//                 x: (Math.random() - 0.5) * 0.02,
//                 y: (Math.random() - 0.5) * 0.02,
//                 z: Math.random() * 0.03 + 0.01
//             },
//             rotationSpeed: {
//                 x: (Math.random() - 0.5) * 0.02,
//                 y: (Math.random() - 0.5) * 0.02,
//                 z: (Math.random() - 0.5) * 0.02
//             }
//         };
        
//         scene.add(meteor);
//     }
    
//     // LARGE PLANET/MOON - In the distance
//     const planetGeometry = new THREE.SphereGeometry(3, 32, 32);
//     const planetEdges = new THREE.EdgesGeometry(planetGeometry);
//     const planetMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.15
//     });
//     const planet = new THREE.LineSegments(planetEdges, planetMaterial);
//     planet.position.set(15, -10, -30);
//     planet.userData = { type: 'planet' };
//     scene.add(planet);
    
//     // ASTEROID BELT - Ring of debris
//     const beltGeometry = new THREE.TorusGeometry(8, 0.3, 8, 50);
//     const beltEdges = new THREE.EdgesGeometry(beltGeometry);
//     const beltMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.2
//     });
//     const belt = new THREE.LineSegments(beltEdges, beltMaterial);
//     belt.position.set(-12, 5, -25);
//     belt.rotation.x = Math.PI / 4;
//     belt.userData = { type: 'belt' };
//     scene.add(belt);
    
//     // DISTANT WIREFRAME STRUCTURE - Like a space station
//     const structureGeometry = new THREE.IcosahedronGeometry(2, 0);
//     const structureEdges = new THREE.EdgesGeometry(structureGeometry);
//     const structureMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.25
//     });
//     const structure = new THREE.LineSegments(structureEdges, structureMaterial);
//     structure.position.set(-8, 8, -20);
//     structure.userData = { type: 'structure' };
//     scene.add(structure);
    
//     // NEBULA PARTICLES - Colorful gas clouds
//     const nebulaGeometry = new THREE.BufferGeometry();
//     const nebulaCount = 500;
//     const nebulaPositions = new Float32Array(nebulaCount * 3);
    
//     for(let i = 0; i < nebulaCount; i++) {
//         const angle = Math.random() * Math.PI * 2;
//         const radius = Math.random() * 15 + 5;
//         nebulaPositions[i * 3] = Math.cos(angle) * radius;
//         nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
//         nebulaPositions[i * 3 + 2] = Math.sin(angle) * radius - 40;
//     }
    
//     nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    
//     const nebulaMaterial = new THREE.PointsMaterial({
//         size: 0.8,
//         color: 0xff6699,
//         transparent: true,
//         opacity: 0.2,
//         blending: THREE.AdditiveBlending
//     });
    
//     const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
//     nebula.userData = { type: 'nebula' };
//     scene.add(nebula);
// }

// function animate() {
//     requestAnimationFrame(animate);
    
//     // STAR FIELD - Slow rotation and twinkling
//     if(particlesMesh) {
//         particlesMesh.rotation.y += 0.0001;
//         particlesMesh.rotation.x += 0.00005;
//     }
    
//     // Animate all space objects
//     scene.children.forEach(child => {
//         // SHOOTING STARS - Streak across space
//         if(child.userData.type === 'shootingStar') {
//             child.position.x += child.userData.velocity.x;
//             child.position.y += child.userData.velocity.y;
//             child.position.z += child.userData.velocity.z;
            
//             // Reset shooting star after some time
//             if(Date.now() > child.userData.resetTime) {
//                 child.position.set(
//                     (Math.random() - 0.5) * 50,
//                     (Math.random() - 0.5) * 50,
//                     -Math.random() * 50 - 10
//                 );
//                 child.userData.resetTime = Date.now() + Math.random() * 10000 + 5000;
//             }
            
//             // Fade out as it moves
//             const age = (Date.now() - (child.userData.resetTime - 15000)) / 15000;
//             child.material.opacity = Math.max(0, 0.8 - age);
//         }
        
//         // METEORS - Flying through space
//         if(child.userData.type === 'meteor') {
//             // Move meteor
//             child.position.x += child.userData.velocity.x;
//             child.position.y += child.userData.velocity.y;
//             child.position.z += child.userData.velocity.z;
            
//             // Rotate meteor (tumbling through space)
//             child.rotation.x += child.userData.rotationSpeed.x;
//             child.rotation.y += child.userData.rotationSpeed.y;
//             child.rotation.z += child.userData.rotationSpeed.z;
            
//             // Reset position if meteor goes too far (infinite loop)
//             if(child.position.z > 20) {
//                 child.position.z = -40;
//                 child.position.x = (Math.random() - 0.5) * 40;
//                 child.position.y = (Math.random() - 0.5) * 40;
//             }
            
//             // Fade out meteors as they get closer (depth effect)
//             const distance = camera.position.z - child.position.z;
//             child.material.opacity = Math.min(0.6, Math.max(0.1, distance / 50));
//         }
        
//         // PLANET - Slow rotation
//         if(child.userData.type === 'planet') {
//             child.rotation.y += 0.002;
//         }
        
//         // ASTEROID BELT - Rotation
//         if(child.userData.type === 'belt') {
//             child.rotation.z += 0.003;
//         }
        
//         // STRUCTURE - Slow spin
//         if(child.userData.type === 'structure') {
//             child.rotation.x += 0.004;
//             child.rotation.y += 0.002;
//         }
        
//         // GALAXIES - Subtle movement
//         if(child.userData.type === 'galaxies') {
//             child.rotation.y += 0.0002;
//         }
        
//         // NEBULA - Gentle pulsing and rotation
//         if(child.userData.type === 'nebula') {
//             child.rotation.y += 0.001;
//             // Pulsing effect
//             const time = Date.now() * 0.001;
//             child.material.opacity = 0.15 + Math.sin(time) * 0.05;
//         }
//     });
    
//     // STAR WARS STYLE CAMERA MOVEMENT
//     // Mouse parallax effect (less aggressive than before)
//     camera.position.x += (mouseX * 0.02 - camera.position.x) * 0.03;
//     camera.position.y += (-mouseY * 0.02 - camera.position.y) * 0.03;
    
//     // SCROLL EFFECT - Flying through space
//     // The more you scroll, the deeper into space you go
//     const scrollProgress = scrollY * 0.01;
//     camera.position.z = 5 - scrollProgress * 0.5; // Move forward through space
    
//     // Subtle roll effect as you fly through space
//     camera.rotation.z = Math.sin(scrollProgress * 0.1) * 0.02;
    
//     // Look slightly ahead
//     const lookAtOffset = new THREE.Vector3(
//         mouseX * 2,
//         -mouseY * 2,
//         -10
//     );
//     camera.lookAt(lookAtOffset);
    
//     renderer.render(scene, camera);
// }

// function onMouseMove(event) {
//     mouseX = (event.clientX / window.innerWidth) * 2 - 1;
//     mouseY = (event.clientY / window.innerHeight) * 2 - 1;
// }

// function onScroll() {
//     scrollY = window.scrollY;
//     updateActiveSection();
// }

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function setupNavigation() {
//     const dots = document.querySelectorAll('.nav-dot');
//     const sections = document.querySelectorAll('section');
    
//     dots.forEach(dot => {
//         dot.addEventListener('click', () => {
//             const sectionIndex = parseInt(dot.getAttribute('data-section'));
//             sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
//         });
//     });
// }

// function updateActiveSection() {
//     const sections = document.querySelectorAll('section');
//     const dots = document.querySelectorAll('.nav-dot');
//     const scrollPosition = window.scrollY + window.innerHeight / 2;
    
//     sections.forEach((section, index) => {
//         const sectionTop = section.offsetTop;
//         const sectionBottom = sectionTop + section.offsetHeight;
        
//         if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
//             dots.forEach(dot => dot.classList.remove('active'));
//             if(dots[index]) dots[index].classList.add('active');
//         }
//     });
    
//     // Hide scroll indicator after first section
//     const scrollIndicator = document.querySelector('.scroll-indicator');
//     if(scrollIndicator) {
//         if(window.scrollY > window.innerHeight * 0.5) {
//             scrollIndicator.style.opacity = '0';
//         } else {
//             scrollIndicator.style.opacity = '0.5';
//         }
//     }
// }

// // PROJECT PAGES FUNCTIONALITY
// function createProjectPages() {
//     const container = document.getElementById('project-pages-container');
    
//     Object.keys(projectsData).forEach(categoryKey => {
//         const category = projectsData[categoryKey];
//         const projectPage = document.createElement('div');
//         projectPage.className = 'project-page';
//         projectPage.id = `page-${categoryKey}`;
        
//         // Header
//         const header = `
//             <div class="project-header">
//                 <button class="back-btn" onclick="closeProjectPage('${categoryKey}')">← BACK</button>
//                 <div class="project-category-title">${category.title}</div>
//                 <div class="project-counter"><span id="counter-${categoryKey}">1</span>/${category.projects.length}</div>
//             </div>
//         `;
        
//         // Projects scroll container
//         let projectsHTML = '<div class="project-scroll-container" id="scroll-' + categoryKey + '">';
//         projectsHTML += '<div class="project-cards-wrapper">';
        
//         category.projects.forEach((project, index) => {
//             const linkHTML = project.link 
//                 ? `<a href="${project.link}" target="_blank" class="project-link">VIEW PROJECT</a>`
//                 : `<div class="project-link disabled">IN PRODUCTION</div>`;
            
//             projectsHTML += `
//                 <div class="project-card" data-index="${index}">
//                     <div class="project-card-number">${String(index + 1).padStart(2, '0')}</div>
//                     <div class="project-card-title">${project.title}</div>
//                     <div class="project-card-desc">${project.description}</div>
//                     <div class="project-tags">
//                         ${project.tech.map(tech => `<span class="project-tag">${tech}</span>`).join('')}
//                     </div>
//                     ${linkHTML}
//                 </div>
//             `;
//         });
        
//         projectsHTML += '</div></div>';
        
//         // Scroll hint
//         const scrollHint = '<div class="scroll-hint">← DRAG TO SCROLL →</div>';
        
//         projectPage.innerHTML = header + projectsHTML + scrollHint;
//         container.appendChild(projectPage);
        
//         // Add scroll listener for counter update
//         const scrollContainer = projectPage.querySelector('.project-scroll-container');
//         scrollContainer.addEventListener('scroll', () => updateProjectCounter(categoryKey, scrollContainer));
//     });
// }

// function updateProjectCounter(categoryKey, scrollContainer) {
//     const cards = scrollContainer.querySelectorAll('.project-card');
//     const scrollLeft = scrollContainer.scrollLeft;
//     const containerWidth = scrollContainer.offsetWidth;
    
//     cards.forEach((card, index) => {
//         const cardLeft = card.offsetLeft - scrollContainer.offsetLeft;
//         const cardCenter = cardLeft + (card.offsetWidth / 2);
//         const viewportCenter = scrollLeft + (containerWidth / 2);
        
//         if (Math.abs(cardCenter - viewportCenter) < card.offsetWidth / 2) {
//             const counter = document.getElementById(`counter-${categoryKey}`);
//             if(counter) counter.textContent = index + 1;
//         }
//     });
// }

// function openProjectPage(categoryKey) {
//     const page = document.getElementById(`page-${categoryKey}`);
//     const transition = document.querySelector('.page-transition');
    
//     // Page transition effect
//     transition.classList.add('active');
    
//     setTimeout(() => {
//         // Hide main content
//         document.querySelector('.content').style.display = 'none';
//         document.querySelector('.nav-dots').style.display = 'none';
//         document.querySelector('.scroll-indicator').style.display = 'none';
        
//         // Show project page
//         page.classList.add('active');
//         document.body.style.overflow = 'hidden';
        
//         // Remove transition
//         transition.classList.remove('active');
//     }, 500);
// }

// function closeProjectPage(categoryKey) {
//     const page = document.getElementById(`page-${categoryKey}`);
//     const transition = document.querySelector('.page-transition');
    
//     // Page transition effect
//     transition.classList.add('active');
    
//     setTimeout(() => {
//         // Hide project page
//         page.classList.remove('active');
//         document.body.style.overflow = '';
        
//         // Show main content
//         document.querySelector('.content').style.display = 'block';
//         document.querySelector('.nav-dots').style.display = 'flex';
//         document.querySelector('.scroll-indicator').style.display = 'block';
        
//         // Remove transition
//         setTimeout(() => {
//             transition.classList.remove('active');
//         }, 100);
//     }, 500);
// }

// // CATEGORY CARD CLICK HANDLERS
// function setupCategoryCards() {
//     const categoryCards = document.querySelectorAll('.category-card');
    
//     categoryCards.forEach(card => {
//         card.addEventListener('click', () => {
//             const category = card.getAttribute('data-category');
//             openProjectPage(category);
//         });
        
//         // Hover effect on shapes
//         card.addEventListener('mouseenter', () => {
//             scene.children.forEach(child => {
//                 if(child.userData.type) {
//                     child.rotation.x += Math.random() * 0.1 - 0.05;
//                     child.rotation.y += Math.random() * 0.1 - 0.05;
//                 }
//             });
//         });
//     });
// }

// // SKILL INTERACTIONS
// function setupSkillInteractions() {
//     const skillItems = document.querySelectorAll('.skill-item');
    
//     skillItems.forEach(item => {
//         item.addEventListener('mouseenter', () => {
//             if(particlesMesh) {
//                 particlesMesh.rotation.x += 0.1;
//                 particlesMesh.rotation.y += 0.1;
//             }
//         });
//     });
// }

// // CONTACT FORM HANDLER
// function setupContactForm() {
//     const contactForm = document.getElementById('contact-form');
//     const submitBtn = document.getElementById('submit-btn');
//     const formStatus = document.getElementById('form-status');
    
//     if(!contactForm) return;
    
//     contactForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const email = document.getElementById('email').value;
//         const message = document.getElementById('message').value;
        
//         // Disable button and show loading
//         submitBtn.disabled = true;
//         submitBtn.textContent = 'SENDING...';
//         submitBtn.style.opacity = '0.5';
        
//         try {
//             const response = await fetch('/api/contact', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     email: email,
//                     message: message
//                 })
//             });
            
//             const data = await response.json();
            
//             if (response.ok) {
//                 formStatus.textContent = 'MESSAGE SENT SUCCESSFULLY';
//                 formStatus.classList.add('visible');
//                 formStatus.style.color = '#fff';
//                 contactForm.reset();
                
//                 setTimeout(() => {
//                     formStatus.classList.remove('visible');
//                 }, 5000);
//             } else {
//                 throw new Error(data.error || 'Failed to send message');
//             }
//         } catch (error) {
//             formStatus.textContent = 'FAILED TO SEND. TRY AGAIN.';
//             formStatus.classList.add('visible');
//             formStatus.style.color = '#ff4444';
            
//             setTimeout(() => {
//                 formStatus.classList.remove('visible');
//             }, 5000);
//         } finally {
//             submitBtn.disabled = false;
//             submitBtn.textContent = 'SEND';
//             submitBtn.style.opacity = '1';
//         }
//     });
// }

// // KEYBOARD NAVIGATION
// function setupKeyboardNav() {
//     document.addEventListener('keydown', (e) => {
//         const sections = document.querySelectorAll('section');
//         const currentSection = Array.from(sections).findIndex(section => {
//             const rect = section.getBoundingClientRect();
//             return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
//         });
        
//         if(e.key === 'ArrowDown' && currentSection < sections.length - 1) {
//             e.preventDefault();
//             sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
//         } else if(e.key === 'ArrowUp' && currentSection > 0) {
//             e.preventDefault();
//             sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
//         }
        
//         // ESC to close project pages
//         if(e.key === 'Escape') {
//             const activePage = document.querySelector('.project-page.active');
//             if(activePage) {
//                 const categoryKey = activePage.id.replace('page-', '');
//                 closeProjectPage(categoryKey);
//             }
//         }
//     });
// }

// // INITIALIZATION
// window.addEventListener('load', () => {
//     init();
//     createProjectPages();
//     setupCategoryCards();
//     setupSkillInteractions();
//     setupContactForm();
//     setupKeyboardNav();
    
//     // Loading animation
//     document.body.style.opacity = '0';
//     setTimeout(() => {
//         document.body.style.transition = 'opacity 1s ease';
//         document.body.style.opacity = '1';
//     }, 100);
// });

// // PERFORMANCE OPTIMIZATION
// document.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         renderer.setAnimationLoop(null);
//     } else {
//         renderer.setAnimationLoop(animate);
//     }
// });












// First Effect Inactive



// // Three.js Scene Setup
// let scene, camera, renderer, particles, particlesMesh;
// let mouseX = 0, mouseY = 0;
// let scrollY = 0;

// function init() {
//     // Scene
//     scene = new THREE.Scene();
    
//     // Camera
//     camera = new THREE.PerspectiveCamera(
//         75,
//         window.innerWidth / window.innerHeight,
//         0.1,
//         1000
//     );
//     camera.position.z = 5;
    
//     // Renderer
//     renderer = new THREE.WebGLRenderer({ 
//         alpha: true,
//         antialias: true 
//     });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     document.getElementById('canvas-container').appendChild(renderer.domElement);
    
//     // Create Particles
//     createParticles();
    
//     // Create Geometric Shapes
//     createGeometry();
    
//     // Lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambientLight);
    
//     const pointLight = new THREE.PointLight(0xffffff, 1);
//     pointLight.position.set(5, 5, 5);
//     scene.add(pointLight);
    
//     // Event Listeners
//     window.addEventListener('resize', onWindowResize);
//     document.addEventListener('mousemove', onMouseMove);
//     window.addEventListener('scroll', onScroll);
    
//     // Navigation dots
//     setupNavigation();
    
//     // Animate
//     animate();
// }

// function createParticles() {
//     const particlesGeometry = new THREE.BufferGeometry();
//     const particlesCount = 1000;
//     const posArray = new Float32Array(particlesCount * 3);
    
//     for(let i = 0; i < particlesCount * 3; i++) {
//         posArray[i] = (Math.random() - 0.5) * 20;
//     }
    
//     particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
//     const particlesMaterial = new THREE.PointsMaterial({
//         size: 0.02,
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.6,
//         blending: THREE.AdditiveBlending
//     });
    
//     particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
//     scene.add(particlesMesh);
// }

// function createGeometry() {
//     // Rotating Cube
//     const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
//     const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
//     const cubeMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.3
//     });
//     const cube = new THREE.LineSegments(cubeEdges, cubeMaterial);
//     cube.position.set(-3, 2, -2);
//     scene.add(cube);
//     cube.userData = { type: 'cube' };
    
//     // Torus
//     const torusGeometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
//     const torusEdges = new THREE.EdgesGeometry(torusGeometry);
//     const torusMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.3
//     });
//     const torus = new THREE.LineSegments(torusEdges, torusMaterial);
//     torus.position.set(3, -2, -3);
//     scene.add(torus);
//     torus.userData = { type: 'torus' };
    
//     // Sphere
//     const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
//     const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
//     const sphereMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.3
//     });
//     const sphere = new THREE.LineSegments(sphereEdges, sphereMaterial);
//     sphere.position.set(2, 3, -4);
//     scene.add(sphere);
//     sphere.userData = { type: 'sphere' };
    
//     // Octahedron
//     const octaGeometry = new THREE.OctahedronGeometry(0.8);
//     const octaEdges = new THREE.EdgesGeometry(octaGeometry);
//     const octaMaterial = new THREE.LineBasicMaterial({ 
//         color: 0xffffff,
//         transparent: true,
//         opacity: 0.3
//     });
//     const octa = new THREE.LineSegments(octaEdges, octaMaterial);
//     octa.position.set(-2, -3, -3);
//     scene.add(octa);
//     octa.userData = { type: 'octa' };
// }

// function animate() {
//     requestAnimationFrame(animate);
    
//     // Rotate particles
//     if(particlesMesh) {
//         particlesMesh.rotation.y += 0.0005;
//         particlesMesh.rotation.x += 0.0003;
//     }
    
//     // Animate geometric shapes
//     scene.children.forEach(child => {
//         if(child.userData.type === 'cube') {
//             child.rotation.x += 0.005;
//             child.rotation.y += 0.005;
//         }
//         if(child.userData.type === 'torus') {
//             child.rotation.x += 0.003;
//             child.rotation.y += 0.007;
//         }
//         if(child.userData.type === 'sphere') {
//             child.rotation.y += 0.004;
//         }
//         if(child.userData.type === 'octa') {
//             child.rotation.x += 0.006;
//             child.rotation.z += 0.004;
//         }
//     });
    
//     // Mouse parallax effect
//     camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
//     camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
//     camera.lookAt(scene.position);
    
//     // Scroll effect
//     camera.position.y = scrollY * 0.002;
//     camera.position.z = 5 + scrollY * 0.001;
    
//     renderer.render(scene, camera);
// }

// function onMouseMove(event) {
//     mouseX = (event.clientX / window.innerWidth) * 2 - 1;
//     mouseY = (event.clientY / window.innerHeight) * 2 - 1;
// }

// function onScroll() {
//     scrollY = window.scrollY;
//     updateActiveSection();
// }

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }

// function setupNavigation() {
//     const dots = document.querySelectorAll('.nav-dot');
//     const sections = document.querySelectorAll('section');
    
//     dots.forEach(dot => {
//         dot.addEventListener('click', () => {
//             const sectionIndex = parseInt(dot.getAttribute('data-section'));
//             sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
//         });
//     });
// }

// function updateActiveSection() {
//     const sections = document.querySelectorAll('section');
//     const dots = document.querySelectorAll('.nav-dot');
//     const scrollPosition = window.scrollY + window.innerHeight / 2;
    
//     sections.forEach((section, index) => {
//         const sectionTop = section.offsetTop;
//         const sectionBottom = sectionTop + section.offsetHeight;
        
//         if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
//             dots.forEach(dot => dot.classList.remove('active'));
//             if(dots[index]) dots[index].classList.add('active');
//         }
//     });
    
//     // Hide scroll indicator after first section
//     const scrollIndicator = document.querySelector('.scroll-indicator');
//     if(scrollIndicator) {
//         if(window.scrollY > window.innerHeight * 0.5) {
//             scrollIndicator.style.opacity = '0';
//         } else {
//             scrollIndicator.style.opacity = '0.5';
//         }
//     }
// }

// // PROJECT PAGES FUNCTIONALITY
// function createProjectPages() {
//     const container = document.getElementById('project-pages-container');
    
//     Object.keys(projectsData).forEach(categoryKey => {
//         const category = projectsData[categoryKey];
//         const projectPage = document.createElement('div');
//         projectPage.className = 'project-page';
//         projectPage.id = `page-${categoryKey}`;
        
//         // Header
//         const header = `
//             <div class="project-header">
//                 <button class="back-btn" onclick="closeProjectPage('${categoryKey}')">← BACK</button>
//                 <div class="project-category-title">${category.title}</div>
//                 <div class="project-counter"><span id="counter-${categoryKey}">1</span>/${category.projects.length}</div>
//             </div>
//         `;
        
//         // Projects scroll container
//         let projectsHTML = '<div class="project-scroll-container" id="scroll-' + categoryKey + '">';
//         projectsHTML += '<div class="project-cards-wrapper">';
        
//         category.projects.forEach((project, index) => {
//             const linkHTML = project.link 
//                 ? `<a href="${project.link}" target="_blank" class="project-link">VIEW PROJECT</a>`
//                 : `<div class="project-link disabled">IN PRODUCTION</div>`;
            
//             projectsHTML += `
//                 <div class="project-card" data-index="${index}">
//                     <div class="project-card-number">${String(index + 1).padStart(2, '0')}</div>
//                     <div class="project-card-title">${project.title}</div>
//                     <div class="project-card-desc">${project.description}</div>
//                     <div class="project-tags">
//                         ${project.tech.map(tech => `<span class="project-tag">${tech}</span>`).join('')}
//                     </div>
//                     ${linkHTML}
//                 </div>
//             `;
//         });
        
//         projectsHTML += '</div></div>';
        
//         // Scroll hint
//         const scrollHint = '<div class="scroll-hint">← DRAG TO SCROLL →</div>';
        
//         projectPage.innerHTML = header + projectsHTML + scrollHint;
//         container.appendChild(projectPage);
        
//         // Add scroll listener for counter update
//         const scrollContainer = projectPage.querySelector('.project-scroll-container');
//         scrollContainer.addEventListener('scroll', () => updateProjectCounter(categoryKey, scrollContainer));
//     });
// }

// function updateProjectCounter(categoryKey, scrollContainer) {
//     const cards = scrollContainer.querySelectorAll('.project-card');
//     const scrollLeft = scrollContainer.scrollLeft;
//     const containerWidth = scrollContainer.offsetWidth;
    
//     cards.forEach((card, index) => {
//         const cardLeft = card.offsetLeft - scrollContainer.offsetLeft;
//         const cardCenter = cardLeft + (card.offsetWidth / 2);
//         const viewportCenter = scrollLeft + (containerWidth / 2);
        
//         if (Math.abs(cardCenter - viewportCenter) < card.offsetWidth / 2) {
//             const counter = document.getElementById(`counter-${categoryKey}`);
//             if(counter) counter.textContent = index + 1;
//         }
//     });
// }

// function openProjectPage(categoryKey) {
//     const page = document.getElementById(`page-${categoryKey}`);
//     const transition = document.querySelector('.page-transition');
    
//     // Page transition effect
//     transition.classList.add('active');
    
//     setTimeout(() => {
//         // Hide main content
//         document.querySelector('.content').style.display = 'none';
//         document.querySelector('.nav-dots').style.display = 'none';
//         document.querySelector('.scroll-indicator').style.display = 'none';
        
//         // Show project page
//         page.classList.add('active');
//         document.body.style.overflow = 'hidden';
        
//         // Remove transition
//         transition.classList.remove('active');
//     }, 500);
// }

// function closeProjectPage(categoryKey) {
//     const page = document.getElementById(`page-${categoryKey}`);
//     const transition = document.querySelector('.page-transition');
    
//     // Page transition effect
//     transition.classList.add('active');
    
//     setTimeout(() => {
//         // Hide project page
//         page.classList.remove('active');
//         document.body.style.overflow = '';
        
//         // Show main content
//         document.querySelector('.content').style.display = 'block';
//         document.querySelector('.nav-dots').style.display = 'flex';
//         document.querySelector('.scroll-indicator').style.display = 'block';
        
//         // Remove transition
//         setTimeout(() => {
//             transition.classList.remove('active');
//         }, 100);
//     }, 500);
// }

// // CATEGORY CARD CLICK HANDLERS
// function setupCategoryCards() {
//     const categoryCards = document.querySelectorAll('.category-card');
    
//     categoryCards.forEach(card => {
//         card.addEventListener('click', () => {
//             const category = card.getAttribute('data-category');
//             openProjectPage(category);
//         });
        
//         // Hover effect on shapes
//         card.addEventListener('mouseenter', () => {
//             scene.children.forEach(child => {
//                 if(child.userData.type) {
//                     child.rotation.x += Math.random() * 0.1 - 0.05;
//                     child.rotation.y += Math.random() * 0.1 - 0.05;
//                 }
//             });
//         });
//     });
// }

// // SKILL INTERACTIONS
// function setupSkillInteractions() {
//     const skillItems = document.querySelectorAll('.skill-item');
    
//     skillItems.forEach(item => {
//         item.addEventListener('mouseenter', () => {
//             if(particlesMesh) {
//                 particlesMesh.rotation.x += 0.1;
//                 particlesMesh.rotation.y += 0.1;
//             }
//         });
//     });
// }

// // CONTACT FORM HANDLER
// function setupContactForm() {
//     const contactForm = document.getElementById('contact-form');
//     const submitBtn = document.getElementById('submit-btn');
//     const formStatus = document.getElementById('form-status');
    
//     if(!contactForm) return;
    
//     contactForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const email = document.getElementById('email').value;
//         const message = document.getElementById('message').value;
        
//         // Disable button and show loading
//         submitBtn.disabled = true;
//         submitBtn.textContent = 'SENDING...';
//         submitBtn.style.opacity = '0.5';
        
//         try {
//             const response = await fetch('/api/contact', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     email: email,
//                     message: message
//                 })
//             });
            
//             const data = await response.json();
            
//             if (response.ok) {
//                 formStatus.textContent = 'MESSAGE SENT SUCCESSFULLY';
//                 formStatus.classList.add('visible');
//                 formStatus.style.color = '#fff';
//                 contactForm.reset();
                
//                 setTimeout(() => {
//                     formStatus.classList.remove('visible');
//                 }, 5000);
//             } else {
//                 throw new Error(data.error || 'Failed to send message');
//             }
//         } catch (error) {
//             formStatus.textContent = 'FAILED TO SEND. TRY AGAIN.';
//             formStatus.classList.add('visible');
//             formStatus.style.color = '#ff4444';
            
//             setTimeout(() => {
//                 formStatus.classList.remove('visible');
//             }, 5000);
//         } finally {
//             submitBtn.disabled = false;
//             submitBtn.textContent = 'SEND';
//             submitBtn.style.opacity = '1';
//         }
//     });
// }

// // KEYBOARD NAVIGATION
// function setupKeyboardNav() {
//     document.addEventListener('keydown', (e) => {
//         const sections = document.querySelectorAll('section');
//         const currentSection = Array.from(sections).findIndex(section => {
//             const rect = section.getBoundingClientRect();
//             return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
//         });
        
//         if(e.key === 'ArrowDown' && currentSection < sections.length - 1) {
//             e.preventDefault();
//             sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
//         } else if(e.key === 'ArrowUp' && currentSection > 0) {
//             e.preventDefault();
//             sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
//         }
        
//         // ESC to close project pages
//         if(e.key === 'Escape') {
//             const activePage = document.querySelector('.project-page.active');
//             if(activePage) {
//                 const categoryKey = activePage.id.replace('page-', '');
//                 closeProjectPage(categoryKey);
//             }
//         }
//     });
// }

// // INITIALIZATION
// window.addEventListener('load', () => {
//     init();
//     createProjectPages();
//     setupCategoryCards();
//     setupSkillInteractions();
//     setupContactForm();
//     setupKeyboardNav();
    
//     // Loading animation
//     document.body.style.opacity = '0';
//     setTimeout(() => {
//         document.body.style.transition = 'opacity 1s ease';
//         document.body.style.opacity = '1';
//     }, 100);
// });

// // PERFORMANCE OPTIMIZATION
// document.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         renderer.setAnimationLoop(null);
//     } else {
//         renderer.setAnimationLoop(animate);
//     }
// });
