// app/product/[slug]/page.js
import ProductDetailsClient from './ProductDetailsClient';

// Generate metadata dynamically based on the slug
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/product/slug/${slug}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data = await res.json();
    
    if (data?.product) {
      const product = data.product;
      const imageUrl = product.photos?.[0]?.url || '';
      
      return {
        title: `${product.name} - Nutshola`,
        description: product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `Buy ${product.name} online at Nutshola. Premium quality products.`,
        keywords: [
          product.name,
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
          url: `https://www.nutshola.com/product/${slug}`,
          siteName: 'Nutshola',
          title: `${product.name} - Nutshola`,
          description: product.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `Buy ${product.name} online at Nutshola.`,
          images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
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
    console.error('Error fetching product metadata:', error);
  }
  
  return {
    title: 'Product - Nutshola',
    description: 'Browse premium quality products at Nutshola.',
  };
}

// The page component - passes slug to client component
export default async function ProductPage({ params }) {
  const { slug } = await params;
  return <ProductDetailsClient slug={slug} />;
}