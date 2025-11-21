// app/lib/getRandomImage.ts
import placeholderImageData from "./placeholder-images.json";

// ✅ FIXED: Define types locally instead of importing from JSON
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

type ImageCategory = keyof typeof placeholderImageData;

type CategoryTypes = {
  brandLogos: BrandLogo[];
  offerLogos: OfferLogo[];
  quizImages: QuizImage[];
};

/**
 * Returns a random image object from the specified category.
 * @param category "quizImages" | "brandLogos" | "offerLogos"
 */
export function getRandomImage<T extends ImageCategory>(category: T): CategoryTypes[T][number] {
  const images = placeholderImageData[category] as CategoryTypes[T];
  if (!images || images.length === 0) {
    console.warn(`No images found for category: ${category}`);
    // Return a default placeholder to prevent crashes
    return {
        src: 'https://placehold.co/600x400',
        hint: 'placeholder',
        alt: 'Placeholder image',
        id: 'fallback'
    } as unknown as CategoryTypes[T][number];
  }
  const index = Math.floor(Math.random() * images.length);
  return images[index];
}
