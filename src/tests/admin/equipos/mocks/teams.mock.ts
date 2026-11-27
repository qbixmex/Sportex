import type { TEAM_TYPE } from '@/app/admin/equipos/(actions)/fetch-admin-teams.action';

export const teamsMock: TEAM_TYPE[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'American School',
    permalink: 'american-school',
    imageUrl: null,
    format: '11',
    gender: 'male',
    active: true,
    coach: {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Carlos Pérez',
    },
    playersCount: 12,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    name: 'Colegio Altamira',
    permalink: 'colegio-altamira',
    imageUrl: '/images/colegio-altamira.jpg',
    format: '7',
    gender: 'female',
    active: false,
    coach: null,
    playersCount: 0,
  },
];
