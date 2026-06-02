class SmoothScroll {
    constructor(options = {}) {
        // Find wrapper
        this.wrapper = document.querySelector('#smooth-wrapper');
        if (!this.wrapper) return;

        // Settings
        this.defaultEase = options.ease || 0.075;
        this.ease = this.defaultEase;
        
        // Override with data attribute if present
        const customEase = this.wrapper.getAttribute('data-scroll-ease');
        if (customEase) {
            this.ease = parseFloat(customEase);
        }

        // State
        this.current = 0;
        this.target = 0;
        this.rAF = null;
        this.isRunning = false;
        this.windowHeight = window.innerHeight;
        this.documentHeight = 0;

        // Parallax and in-view elements
        this.parallaxElements = document.querySelectorAll('[data-scroll-speed]');
        this.inViewElements = document.querySelectorAll('[data-scroll-inview]');
        this.ignoreElements = document.querySelectorAll('[data-scroll-ignore]');

        
        // Progress bar
        this.progressBar = document.querySelector('#scroll-progress');

        // Check for reduced motion
        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (this.mediaQuery.matches) {
            this.ease = 1.0;
        }

        // Bind methods
        this.update = this.update.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onLinkClick = this.onLinkClick.bind(this);
    }

    init() {
        if (!this.wrapper) return;

        // Apply styles to body/html
        document.body.style.position = 'relative';
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';

        // Apply styles to wrapper
        this.wrapper.style.position = 'fixed';
        this.wrapper.style.top = '0';
        this.wrapper.style.left = '0';
        this.wrapper.style.width = '100%';
        this.wrapper.style.overflow = 'hidden';
        this.wrapper.style.willChange = 'transform';

        // Set initial heights
        this.onResize();

        // Listeners
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onResize);
        window.addEventListener('keydown', this.onKeyDown);
        
        // Handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.onLinkClick);
        });

        // Set initial values
        this.target = window.scrollY || document.documentElement.scrollTop;
        this.current = this.target;
        this.applyTransform();

        // Start loop if needed
        this.startLoop();
    }

    destroy() {
        this.stopLoop();
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('keydown', this.onKeyDown);
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.removeEventListener('click', this.onLinkClick);
        });

        // Reset styles
        document.body.style.height = '';
        this.wrapper.style.position = '';
        this.wrapper.style.transform = '';
    }

    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.rAF = requestAnimationFrame(this.update);
        }
    }

    stopLoop() {
        if (this.isRunning) {
            cancelAnimationFrame(this.rAF);
            this.isRunning = false;
        }
    }

    onScroll() {
        this.target = window.scrollY || document.documentElement.scrollTop;
        this.startLoop();
    }

    onResize() {
        this.windowHeight = window.innerHeight;
        // Natural height of the inner content
        this.documentHeight = this.wrapper.scrollHeight;
        
        // Set body height to enable native scrollbar
        document.body.style.height = `${this.documentHeight}px`;
    }

    onKeyDown(e) {
        // Browsers handle keyboard scrolling natively via window.scroll by changing scrollY
        // We just need to make sure the loop is running to catch up to the new scrollY
        this.startLoop();
    }

    onLinkClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href === '#') return;

        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            this.scrollTo(targetElement.offsetTop);
        }
    }

    scrollTo(y, animate = true) {
        // Cap the max scroll
        const maxY = this.documentHeight - this.windowHeight;
        y = Math.max(0, Math.min(y, maxY));
        
        if (!animate || this.mediaQuery.matches) {
            window.scrollTo(0, y);
            this.current = y;
            this.target = y;
            this.applyTransform();
        } else {
            window.scrollTo(0, y); // This sets the native target
            this.target = y;
            this.startLoop();
        }
    }

    getProgress() {
        const maxY = this.documentHeight - this.windowHeight;
        if (maxY === 0) return 0;
        return Math.max(0, Math.min(this.current / maxY, 1));
    }

    update() {
        // Lerp equation
        const diff = this.target - this.current;
        const delta = Math.abs(diff);

        // If we are close enough, snap to target and stop loop
        if (delta < 0.1) {
            this.current = this.target;
            this.applyTransform();
            this.stopLoop();
            return;
        }

        // Apply lerp
        this.current += diff * this.ease;
        this.applyTransform();

        // Continue loop
        if (this.isRunning) {
            this.rAF = requestAnimationFrame(this.update);
        }
    }

    applyTransform() {
        // Main wrapper transform
        // Ignore negative current (overscroll bounce) for the transform to prevent wrapper pulling down
        let y = this.current;
        // Optional: limit y to avoid bouncing tearing, though some like the bounce. We'll allow it.
        
        this.wrapper.style.transform = `translate3d(0, ${-y}px, 0)`;

        // Update progress bar
        if (this.progressBar) {
            const progress = this.getProgress();
            this.progressBar.style.transform = `scaleX(${progress})`;
        }

        // Handle Parallax elements
        this.parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-scroll-speed') || 0);
            const offset = y * speed;
            el.style.transform = `translate3d(0, ${offset}px, 0)`;
        });

        // Handle In-View classes
        this.inViewElements.forEach(el => {
            const top = el.offsetTop;
            const bottom = top + el.offsetHeight;
            
            if (top < y + this.windowHeight && bottom > y) {
                el.classList.add('is-inview');
            }
        });

        // Inverse transform for ignored elements (like sticky headers)
        this.ignoreElements.forEach(el => {
            el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
    }
}

// Export as ESM and make available globally for IIFE compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmoothScroll;
} else if (typeof exports !== 'undefined') {
    exports.SmoothScroll = SmoothScroll;
} else {
    window.SmoothScroll = SmoothScroll;
}
