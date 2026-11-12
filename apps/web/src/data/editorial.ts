export interface EditorialMember {
  name: string;
  roleTitle: string;
  affiliation: string;
  department: string;
  country: string;
  orcid?: string;
  bio: string;
  specialization: string[];
}

export interface EditorialSection {
  role: string;
  description: string;
  members: EditorialMember[];
}

export const EDITORIAL_BOARD_DATA: EditorialSection[] = [
  {
    role: 'Editor-in-Chief',
    description: 'Responsible for journal vision, strategic direction, and final publishing decisions.',
    members: [
      {
        name: 'Prof. Dr. Sarah L. Johnson, Ph.D.',
        roleTitle: 'Editor-in-Chief',
        affiliation: 'Stanford University',
        department: 'Department of Computer Science & Human-Centered AI',
        country: 'United States',
        orcid: '0000-0002-1825-0097',
        bio: 'Distinguished Professor of Computing and AI Ethics with over 20 years of research in distributed learning, open research data, and ethical algorithmic transparency.',
        specialization: ['Artificial Intelligence', 'Computational Ethics', 'Open Science Data']
      }
    ]
  },
  {
    role: 'Senior Associate Editors',
    description: 'Oversee specialized subject tracks, handle manuscript triage, and direct the peer review pipeline.',
    members: [
      {
        name: 'Prof. Michael Chen, D.Sc.',
        roleTitle: 'Associate Editor (Systems & Architecture)',
        affiliation: 'Massachusetts Institute of Technology (MIT)',
        department: 'EECS & Distributed Computing Laboratory',
        country: 'United States',
        orcid: '0000-0003-4921-8842',
        bio: 'Chair of Scalable Cloud Architectures and peer-review integrity protocols. Pioneer in decentralized metadata synchronization for academic registries.',
        specialization: ['Distributed Systems', 'Cloud Infrastructures', 'Metadata Federation']
      },
      {
        name: 'Dr. Elena Rodriguez-Vargas, Ph.D.',
        roleTitle: 'Associate Editor (Data Science & Algorithms)',
        affiliation: 'European Organization for Nuclear Research (CERN)',
        department: 'Scientific Computing Division',
        country: 'Switzerland',
        orcid: '0000-0001-7294-3108',
        bio: 'Senior Research Scientist leading high-throughput data processing and reproducible numerical workflows for international research collaborations.',
        specialization: ['High-Performance Computing', 'Open Research Reproducibility', 'Statistical Modeling']
      },
      {
        name: 'Prof. Budi Santoso, M.Kom., Ph.D.',
        roleTitle: 'Associate Editor (Regional & Open Science Outreach)',
        affiliation: 'Institute of Advanced Technology & Research',
        department: 'School of Information Technology',
        country: 'Indonesia',
        orcid: '0000-0002-9912-4501',
        bio: 'National Research Fellow championing equitable open-access publishing models, citation indexation standards, and cross-border research cooperation.',
        specialization: ['Scholarly Communications', 'Knowledge Graphs', 'Semantic Web']
      }
    ]
  },
  {
    role: 'Editorial Advisory Board',
    description: 'International advisors offering governance guidance, quality assurance, and ethical oversight.',
    members: [
      {
        name: 'Dr. Alistair MacIntyre, FRSA',
        roleTitle: 'Advisory Member',
        affiliation: 'University of Oxford',
        department: 'Oxford Internet Institute',
        country: 'United Kingdom',
        orcid: '0000-0002-6120-7739',
        bio: 'Advises scientific journals on publication ethics, Committee on Publication Ethics (COPE) compliance, and digital preservation.',
        specialization: ['Publication Ethics', 'Digital Archiving', 'COPE Compliance']
      },
      {
        name: 'Dr. Kenji Tanaka, Ph.D.',
        roleTitle: 'Advisory Member',
        affiliation: 'University of Tokyo',
        department: 'Graduate School of Information Science and Technology',
        country: 'Japan',
        orcid: '0000-0003-1109-8824',
        bio: 'Specialist in automated citation networks, bibliometrics, and DOI ecosystem integrations across Crossref and DataCite registries.',
        specialization: ['Bibliometrics', 'DOI Ecosystems', 'Citation Analysis']
      }
    ]
  }
];

export const MOCK_EDITORIAL_BOARD = EDITORIAL_BOARD_DATA;
