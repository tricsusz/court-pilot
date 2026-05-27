import Dexie, { type EntityTable } from 'dexie';
import { settings } from 'ionicons/icons';

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

export interface WaitingAsUmpire {
  id: number;
  umpireId: number;
  order: number;
}

export interface WaitingAsServiceJudge {
  id: number;
  serviceJudgeId: number;
  order: number;
}

export interface Settings {
  id: number;
  withServiceJudge: boolean;
  numberOfCourts: number;
}

const db = new Dexie('CourtPilot') as Dexie & {
  umpires: EntityTable<Umpire, 'id'>;
  courts: EntityTable<Court, 'id'>;
  settings: EntityTable<Settings, 'id'>;
  waitingUmpires: EntityTable<WaitingAsUmpire, 'id'>;
  waitingServiceJudges: EntityTable<WaitingAsServiceJudge, 'id'>;
};

db.version(1).stores({
  umpires: '++id, lastName',
  courts: '++id, umpireId, serviceJudgeId',
  settings: '++id',
  waitingUmpires: '++id, order, umpireId',
  waitingServiceJudges: '++id, order, serviceJudgeId'
});

export { db };
