// lib/getRandomImage.ts

/**
 * Image type definitions for different categories
 */
type BrandLogo = {
  id: string;
  src: string;
  alt: string;
  hint: string;
};

type OfferLogo = {
  id: string;
  src: string;
  alt: string;
  hint: string;
};

type QuizImage = {
  id: string;
  src: string;
  alt: string;
  hint: string;
};

/**
 * Placeholder image data with all categories
 */
const placeholderImageData = {
  brandLogos: [
    {
      id: "brand-1",
      src: "https://placehold.co/100x100?text=Brand+1",
      alt: "Brand Logo 1",
      hint: "brand",
    },
    {
      id: "brand-2",
      src: "https://placehold.co/100x100?text=Brand+2",
      alt: "Brand Logo 2",
      hint: "brand",
    },
    {
      id: "brand-3",
      src: "https://placehold.co/100x100?text=Brand+3",
      alt: "Brand Logo 3",
      hint: "brand",
    },
  ] as BrandLogo[],

  offerLogos: [
    {
      id: "offer-1",
      src: "https://placehold.co/100x100?text=Offer+1",
      alt: "Offer Logo 1",
      hint: "offer",
    },
    {
      id: "offer-2",
      src: "https://placehold.co/100x100?text=Offer+2",
      alt: "Offer Logo 2",
      hint: "offer",
    },
    {
      id: "offer-3",
      src: "https://placehold.co/100x100?text=Offer+3",
      alt: "Offer Logo 3",
      hint: "offer",
    },
  ] as OfferLogo[],

  quizImages: [
    {
      id: "quiz-1",
      src: "https://placehold.co/600x400?text=Quiz+1",
      alt: "Quiz Image 1",
      hint: "quiz",
    },
    {
      id: "quiz-2",
      src: "https://placehold.co/600x400?text=Quiz+2",
      alt: "Quiz Image 2",
      hint: "quiz",
    },
    {
      id: "quiz-3",
      src: "https://placehold.co/600x400?text=Quiz+3",
      alt: "Quiz Image 3",
      hint: "quiz",
    },
  ] as QuizImage[],
} as const;

type ImageCategory = keyof typeof placeholderImageData;

type CategoryTypes = {
  brandLogos: BrandLogo;
  offerLogos: OfferLogo;
  quizImages: QuizImage;
};

/**
 * Returns a random image object from the specified category.
 * @param category - The image category: "quizImages" | "brandLogos" | "offerLogos"
 * @returns A random image object from the specified category
 */
export function getRandomImage<T extends ImageCategory>(category: T): CategoryTypes[T] {
  const images = placeholderImageData[category];

  if (!images || images.length === 0) {
    console.warn(`No images found for category: ${String(category)}`);
    
    // Return a default placeholder based on category
    const defaultPlaceholder: any = {
      id: "fallback",
      src: "https://placehold.co/600x400?text=Placeholder",
      alt: "Placeholder image",
      hint: "placeholder",
    };
    
    return defaultPlaceholder as CategoryTypes[T];
  }

  // Get random index
  const randomIndex = Math.floor(Math.random() * images.length);
  
  // Return random image with proper type
  return images[randomIndex] as unknown as CategoryTypes[T];
}

// Export types for use in other modules
export type { BrandLogo, OfferLogo, QuizImage, ImageCategory };
export { placeholderImageData };
