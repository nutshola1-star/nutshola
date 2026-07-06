// app/categories/[slug]/page.js
import CategoryProductsClient from './CategoryProductsClient';

// Generate metadata dynamically based on the slug
export async function generateMetadata({ params }) {
  // ✅ Await params before accessing slug
  const { slug } = await params;
  console.log("Server Slug:", slug);
  
  try {
    // Fetch category data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(baseUrl)
    const res = await fetch(`${baseUrl}/api/category/slug/${slug}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch category');
    }
    
    const data = await res.json();
    
    if (data.success && data.category) {
      const category = data.category;
      return {
        title: `${category.name} - Nutshola`,
        description: `Buy premium quality ${category.name} online at Nutshola. 100% fresh and authentic ${category.name}. Fast delivery across Bangladesh!`,
        keywords: [
          category.name,
          'Nutshola',
          'premium nuts',
          'spices online BD',
          'সেরা মানের বাদাম',
          'খাঁটি মসলা',
          'buy dry fruits Bangladesh',
          'organic spices',
          'fresh nuts and seeds'
        ],
        authors: [{ name: 'Nutshola' }],
        creator: 'Nutshola',
        publisher: 'Nutshola',
        openGraph: {
          type: 'website',
          locale: 'en_US',
          url: `https://www.nutshola.com/categories/${slug}`,
          siteName: 'Nutshola',
          title: `${category.name} - Nutshola`,
          description: `Buy premium quality ${category.name} online at Nutshola. 100% fresh and authentic products.`,
          images: [
            {
              url: category.image?.url || 'https://res.cloudinary.com/i8ldorjv/image/upload/v1782984009/NutsholaBanner_iimeqh.jpg',
              alt: `${category.name} - Nutshola`,
            },
          ],
        },
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
      };
    }
  } catch (error) {
    console.error('Error fetching category metadata:', error);
  }
  
  // Fallback metadata
  return {
    title: 'Category - Nutshola',
    description: 'Browse premium quality products at Nutshola.',
  };
}

// The page component - passes slug to client component
export default async function CategoryPage({ params }) {
  // ✅ Await params before accessing slug
  const { slug } = await params;
  return <CategoryProductsClient slug={slug} />;
}