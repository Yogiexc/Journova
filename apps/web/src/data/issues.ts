export interface Issue {
  id: string;
  title: string;
  volume: number;
  number: number;
  year: number;
  coverImage?: string;
  publishDate: string;
}

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'issue-1',
    title: 'Current Trends in Technology',
    volume: 1,
    number: 1,
    year: 2026,
    publishDate: '2026-09-01',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'issue-2',
    title: 'Future of Artificial Intelligence',
    volume: 1,
    number: 2,
    year: 2026,
    publishDate: '2026-10-01',
  }
];
