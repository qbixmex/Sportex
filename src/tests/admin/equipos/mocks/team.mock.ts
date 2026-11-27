import type { TEAM_TYPE } from '@/app/admin/equipos/(actions)/fetch-team-for-edit.action';

export const teamMock: TEAM_TYPE = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Águilas',
  permalink: 'aguilas',
  format: '11',
  gender: 'male',
  country: 'México',
  state: 'Jalisco',
  city: 'Guadalajara',
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123, Colonia Centro',
  active: true,
  coachId: 'b7e2ca32-af95-4750-bf63-6a338b236097',
  tournament: {
    id: '660e8400-e29b-41d4-a716-446655440002',
    permalink: 'torneo-a',
  },
  category: {
    id: '770e8400-e29b-41d4-a716-446655440003',
    permalink: 'varonil',
  },
  fieldsIds: ['880e8400-e29b-41d4-a716-446655440004'],
};

export const teamWithoutRelationsMock: TEAM_TYPE = {
  ...teamMock,
  tournament: null,
  category: null,
};

type CreatedTeamMock = {
  id: string;
  name: string;
  permalink: string;
  format: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  emails: string[];
  address: string;
  active: boolean;
  coachId: string | null;
  tournament: { name: string; permalink: string } | null;
  category: { name: string; permalink: string } | null;
};

export const createdTeamMock: CreatedTeamMock = {
  id: teamMock.id,
  name: 'Águilas',
  permalink: 'aguilas',
  format: '11',
  gender: 'male',
  country: 'México',
  state: 'Jalisco',
  city: 'Guadalajara',
  emails: ['aguilas@example.com'],
  address: 'Calle Falsa 123, Colonia Centro',
  active: true,
  coachId: teamMock.coachId,
  tournament: {
    name: 'Torneo Verano',
    permalink: 'torneo-verano',
  },
  category: {
    name: 'Varonil',
    permalink: 'varonil',
  },
};
