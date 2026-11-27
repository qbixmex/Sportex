import type { TEAM_TYPE } from '@/app/admin/equipos/(actions)/fetchTeamAction';

type TeamDetail = NonNullable<TEAM_TYPE>;

export const teamDetailMock: TeamDetail = {
  id: '550e8400-e29b-41d4-a716-446655440030',
  name: 'Águilas',
  permalink: 'aguilas',
  imageUrl: null,
  imagePublicID: null,
  format: '11',
  gender: 'male',
  country: 'México',
  city: 'Guadalajara',
  state: 'Jalisco',
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123, Colonia Centro',
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-15'),
  tournament: {
    id: '660e8400-e29b-41d4-a716-446655440031',
    name: 'Torneo A',
    permalink: 'torneo-a',
  },
  category: {
    id: '770e8400-e29b-41d4-a716-446655440032',
    name: 'Sub-20',
    permalink: 'sub-20',
  },
  coach: {
    id: '880e8400-e29b-41d4-a716-446655440033',
    name: 'Carlos Pérez',
  },
  players: [
    {
      id: '990e8400-e29b-41d4-a716-446655440034',
      name: 'Juan López',
    },
  ],
  fields: [
    {
      id: 'aa0e8400-e29b-41d4-a716-446655440035',
      name: 'Cancha 1',
      map: 'https://www.google.com/maps?q=20.659698,-103.349609&z=16&output=embed',
      address: 'Calle Falsa 123',
      city: 'Guadalajara',
      state: 'Jalisco',
      country: 'México',
    },
  ],
};

export const teamDetailWithoutRelationsMock: TeamDetail = {
  ...teamDetailMock,
  tournament: null,
  category: null,
  coach: null,
  players: [],
  fields: [],
};
