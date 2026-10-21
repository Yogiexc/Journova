import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://journova.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/issues`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/articles?limit=50`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticRoutes;
    const body = await res.json();
    const articles = body.data || body.articles || [];

    const articleRoutes: MetadataRoute.Sitemap = articles.map((art: any) => ({
      url: `${baseUrl}/articles/${art.slug}`,
      lastModified: art.published_at ? new Date(art.published_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
