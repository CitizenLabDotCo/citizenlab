// Creates an IntersectionObserver to have a more efficient way to check for images presence in the viewport
// Explanation: https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/#inline_images

// Polyfill for unspporting browsers
import 'intersection-observer';

export const lazyImageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const lazyImage = entry.target as HTMLImageElement;
      lazyImage.src = lazyImage.dataset.src as string;
      lazyImage.srcset = lazyImage.dataset.srcset as string;
      lazyImageObserver.unobserve(lazyImage);
    }
  });
});
