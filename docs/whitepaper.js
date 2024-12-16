// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animate sections on scroll
document.querySelectorAll('.wp-section').forEach((section, index) => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power2.out"
    });
});

// Animate timeline items
document.querySelectorAll('.timeline-item').forEach((item, index) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: index * 0.15,
        ease: "power2.out"
    });
});
