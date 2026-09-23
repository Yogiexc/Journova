export interface Author {
  name: string;
  affiliation: string;
  email?: string;
  avatar?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  authors: Author[];
  doi: string;
  keywords: string[];
  status: 'Published' | 'Under Review' | 'Accepted';
  publishDate?: string;
  published_at?: string;
  issueId: string;
  views: number;
  downloads: number;
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    slug: 'artificial-intelligence-in-education',
    title: 'Artificial Intelligence in Education: A Paradigm Shift',
    abstract: 'This paper explores the transformative impact of Artificial Intelligence (AI) in the educational sector. We discuss various applications including personalized learning, automated grading, and predictive analytics. The findings suggest that while AI offers significant opportunities for enhancing educational outcomes, it also presents challenges related to data privacy and equity.',
    authors: [
      { name: 'Dr. Sarah Johnson', affiliation: 'Stanford University' },
      { name: 'Prof. Michael Chen', affiliation: 'MIT' }
    ],
    doi: '10.5555/jv.2026.1001',
    keywords: ['AI', 'Education', 'Machine Learning', 'EdTech'],
    status: 'Published',
    publishDate: '2026-09-10',
    issueId: 'issue-1',
    views: 1250,
    downloads: 342
  },
  {
    id: 'art-2',
    slug: 'quantum-computing-algorithms',
    title: 'Advancements in Quantum Computing Algorithms for Optimization',
    abstract: 'Quantum computing has the potential to solve complex optimization problems exponentially faster than classical computers. This study presents a novel quantum algorithm tailored for supply chain optimization. Benchmarking results demonstrate a 40% reduction in computational time compared to state-of-the-art classical methods.',
    authors: [
      { name: 'Dr. Elena Rodriguez', affiliation: 'CERN' },
      { name: 'James Wilson', affiliation: 'University of Cambridge' }
    ],
    doi: '10.5555/jv.2026.1002',
    keywords: ['Quantum Computing', 'Algorithms', 'Optimization'],
    status: 'Published',
    publishDate: '2026-09-12',
    issueId: 'issue-1',
    views: 890,
    downloads: 156
  },
  {
    id: 'art-3',
    slug: 'sustainable-urban-planning',
    title: 'Sustainable Urban Planning: Integrating Green Infrastructure',
    abstract: 'As urbanization accelerates, integrating green infrastructure into city planning is crucial for sustainability. This article reviews case studies from five major metropolitan areas. We highlight best practices in implementing green roofs, urban parks, and permeable pavements, assessing their impact on the urban heat island effect.',
    authors: [
      { name: 'Prof. David Okafor', affiliation: 'University of Toronto' }
    ],
    doi: '10.5555/jv.2026.1003',
    keywords: ['Urban Planning', 'Sustainability', 'Green Infrastructure'],
    status: 'Published',
    publishDate: '2026-09-15',
    issueId: 'issue-1',
    views: 560,
    downloads: 89
  }
];
