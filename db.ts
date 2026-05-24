import Dexie, { type EntityTable } from 'dexie';

export interface Umpire {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  gender: string;
}

export interface Court {
  id: number;
  umpireId: number | null;
  serviceJudgeId: number | null;
  order: number;
}

const db = new Dexie('CourtPilot') as Dexie & {
  umpires: EntityTable<Umpire, 'id'>;
  courts: EntityTable<Court, 'id'>;
};

db.version(1).stores({
  umpires: '++id, lastName',
  courts: '++id, umpireId, serviceJudgeId'
});

export { db };
