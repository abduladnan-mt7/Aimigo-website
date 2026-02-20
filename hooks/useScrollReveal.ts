import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-reveal animations using Intersection Observer.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 * Once visible, the element stays visible (one-shot animation).
 */
export function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element); // Stop observing once revealed
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}
