// Mobile menu functionality
let mobileMenuOpen = false;

function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    if (mobileMenuOpen) {
        mobileMenu.classList.remove('hidden');
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        
        // Add animation class
        mobileMenu.style.animation = 'slideDown 0.3s ease-out';
    } else {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

// Newsletter form handler
async function handleNewsletterSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            alert(`Thank you for subscribing with email: ${email}`);
            event.target.reset();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Newsletter signup error:', error);
        alert('There was an error subscribing to the newsletter. Please try again.');
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Close mobile menu when clicking outside
function initClickOutside() {
    document.addEventListener('click', function(event) {
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburger = document.getElementById('mobile-menu-btn');
        
        if (mobileMenuOpen && 
            !mobileMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            toggleMobileMenu();
        }
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Observe other sections
    document.querySelectorAll('.testimonial-content, .cta-content, .about-content').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(element);
    });
}

// Lazy loading for images
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Header scroll effect
function initHeaderScrollEffect() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add transition to header
    header.style.transition = 'transform 0.3s ease-in-out';
}

// Button click animations
function initButtonAnimations() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Form validation
function initFormValidation() {
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.style.borderBottomColor = '#ff4444';
        } else {
            this.style.borderBottomColor = '#989090';
        }
    });
    
    emailInput.addEventListener('focus', function() {
        this.style.borderBottomColor = '#000';
    });
    
    emailInput.addEventListener('blur', function() {
        if (!this.value) {
            this.style.borderBottomColor = '#989090';
        }
    });
}

// Services dropdown functionality
function initServicesDropdown() {
    const servicesBtn = document.querySelector('.services-btn');
    const servicesMobileBtn = document.querySelector('.services-mobile-btn');
    
    if (servicesBtn) {
        servicesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const arrow = this.querySelector('.dropdown-arrow');
            
            // Rotate arrow animation
            arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            
            // Here you could add dropdown menu functionality
            console.log('Services dropdown clicked');
        });
    }
    
    if (servicesMobileBtn) {
        servicesMobileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const arrow = this.querySelector('.dropdown-arrow');
            
            // Rotate arrow animation
            arrow.style.transform = arrow.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            
            console.log('Mobile services dropdown clicked');
        });
    }
}

// Keyboard navigation support
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && mobileMenuOpen) {
            toggleMobileMenu();
        }
        
        // Enter key on buttons
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll handlers
function initOptimizedScrollHandlers() {
    const debouncedScrollHandler = debounce(() => {
        // Add any scroll-based functionality here
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler);
}

// Error handling for images
function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Failed to load image: ${this.src}`);
            // You could set a placeholder image here
            this.style.backgroundColor = '#f0f0f0';
            this.style.color = '#666';
            this.alt = 'Image failed to load';
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Initialize all features
    initSmoothScrolling();
    initClickOutside();
    initScrollAnimations();
    initLazyLoading();
    initHeaderScrollEffect();
    initButtonAnimations();
    initFormValidation();
    initServicesDropdown();
    initKeyboardNavigation();
    initOptimizedScrollHandlers();
    initImageErrorHandling();
    
    console.log('Barter website initialized successfully!');
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Close mobile menu on desktop resize
    if (window.innerWidth >= 1024 && mobileMenuOpen) {
        toggleMobileMenu();
    }
}, 250));

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
