import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/login', '/register'],
    },
    // sitemap: 'https://journova.com/sitemap.xml',
  };
}
