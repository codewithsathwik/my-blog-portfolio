class SmoothScroll {
    constructor(options = {}) {
        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.lenis = null;
    }

    init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
            console.error('GSAP, ScrollTrigger, or Lenis is not loaded.');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // If user prefers reduced motion, just setup animations without smooth scroll
        if (this.mediaQuery.matches) {
            this.setupAnimations();
            return;
        }

        // Initialize Lenis for native smooth scrolling
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Sync Lenis scroll with GSAP ScrollTrigger
        this.lenis.on('scroll', ScrollTrigger.update);

        // Sync GSAP ticker with Lenis raf
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        // Fixes slight lag between GSAP and Lenis
        gsap.ticker.lagSmoothing(0);

        this.setupAnimations();

        // Handle internal anchor links using Lenis
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('href');
                if (target === '#') return;
                const targetElement = document.querySelector(target);
                if (targetElement) {
                    e.preventDefault();
                    this.lenis.scrollTo(targetElement);
                }
            });
        });
    }

    setupAnimations() {
        // Progress bar animation using ScrollTrigger
        const progressBar = document.querySelector('#scroll-progress');
        if (progressBar) {
            gsap.to(progressBar, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.1
                }
            });
        }

        // Parallax elements
        const parallaxElements = document.querySelectorAll('[data-scroll-speed]');
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-scroll-speed') || 0);
            if (speed === 0) return;

            // This replicates the old logic: offset = scrollY * speed
            gsap.to(el, {
                y: () => ScrollTrigger.maxScroll(window) * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        });

        // In-view elements
        const inViewElements = document.querySelectorAll('[data-scroll-inview]');
        inViewElements.forEach(el => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 90%', // Trigger when the top of the element hits 90% down the viewport
                end: 'bottom top',
                toggleClass: 'is-inview',
            });
        });

        // The old custom script used data-scroll-ignore for sticky elements 
        // because it translated the entire wrapper.
        // With Lenis, native scrolling is preserved, so position: sticky works perfectly 
        // without any JavaScript interference. No need to process data-scroll-ignore!
    }

    destroy() {
        if (this.lenis) {
            this.lenis.destroy();
            this.lenis = null;
        }
        ScrollTrigger.getAll().forEach(t => t.kill());
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
