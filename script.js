/**
 * Portfolio Website JavaScript
 * Author: Deaa Mahmood
 * Features: Smooth scrolling, animations, mobile menu, form handling
 * Security: XSS protection, secure DOM manipulation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initSkillBars();
    initContactForm();
});

/**
 * Navbar - Scroll effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || !href) return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Scroll Animations using Intersection Observer
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Trigger skill bar animation if it's a skill card
                if (entry.target.classList.contains('skill-card')) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    if (progressBar) {
                        const progress = progressBar.getAttribute('data-progress');
                        setTimeout(() => {
                            progressBar.style.width = progress + '%';
                        }, 300);
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elements to animate
    const animateElements = document.querySelectorAll(
        '.about-card, .skill-card, .project-card, .cert-card, .contact-card, .contact-form'
    );
    
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

/**
 * Skill Bars Animation
 */
function initSkillBars() {
    // Initial setup - reset progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        bar.style.width = '0';
    });
    
    // Re-run animation when scrolling (handled in initScrollAnimations)
}

/**
 * Contact Form Handling with EmailJS
 */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    // EmailJS configuration
    const EMAILJS_PUBLIC_KEY = 'Umww6GTpiFG-J8jMb';
    const EMAILJS_SERVICE_ID = 'service_krpp13u';
    const EMAILJS_TEMPLATE_ID = 'template_s8dkkib';
    
    // Initialize EmailJS
    if (window.emailjs) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Simple validation
            if (!data.name || !data.email || !data.subject || !data.message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('Please enter a valid email', 'error');
                return;
            }
            
            // Sanitize input to prevent XSS
            const sanitizedData = {
                name: sanitizeInput(data.name),
                email: sanitizeInput(data.email),
                subject: sanitizeInput(data.subject),
                message: sanitizeInput(data.message)
            };
            
            // Send email using EmailJS
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Send email via EmailJS
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                from_name: sanitizedData.name,
                from_email: sanitizedData.email,
                subject: sanitizedData.subject,
                message: sanitizedData.message,
                to_email: 'deaasesco@gmail.com'
            })
            .then(function(response) {
                // Show success message
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                
                // Reset form
                form.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })
            .catch(function(error) {
                // Show error message
                showNotification('Failed to send message. Please try again or email me directly.', 'error');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                console.error('EmailJS Error:', error);
            });
        });
    }
}

/**
 * Sanitize Input - Prevent XSS attacks
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Show Notification - Secure version (prevents XSS)
 */
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element using safe DOM methods
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create inner structure safely
    const contentDiv = document.createElement('div');
    contentDiv.className = 'notification-content';
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`;
    
    const messageSpan = document.createElement('span');
    // Use textContent instead of innerHTML to prevent XSS
    messageSpan.textContent = message;
    
    contentDiv.appendChild(icon);
    contentDiv.appendChild(messageSpan);
    notification.appendChild(contentDiv);
    
    // Add styles dynamically
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        padding: 15px 25px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 68, 0.15)'};
        border: 1px solid ${type === 'success' ? '#00ff88' : '#ff4444'};
        border-radius: 10px;
        color: ${type === 'success' ? '#00ff88' : '#ff4444'};
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

/**
 * Active Navigation Link on Scroll
 */
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

/**
 * Parallax Effect for Hero Background
 */
window.addEventListener('scroll', function() {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        const scrolled = window.pageYOffset;
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

/**
 * Typing Effect for Hero Title (Optional Enhancement)
 */
function initTypingEffect() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return;
    
    const text = titleElement.textContent;
    titleElement.textContent = '';
    titleElement.style.borderRight = '2px solid #00d4ff';
    
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            titleElement.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            setTimeout(() => {
                titleElement.style.borderRight = 'none';
            }, 1000);
        }
    }, 50);
}

