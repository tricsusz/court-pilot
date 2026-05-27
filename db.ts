import Dexie, { type EntityTable } from 'dexie';

export interface Umpire {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  gender: string;
  courtNo?: number;
}

export interface CourtUmpire {
  id: number;
  umpireId: number | null;
  courtNo: number;
}

export interface CourtServiceJudge {
  id: number;
  umpireId: number | null;
  courtNo: number;
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
  courtUmpires: EntityTable<CourtUmpire, 'id'>;
  courtServiceJudges: EntityTable<CourtServiceJudge, 'id'>;
  settings: EntityTable<Settings, 'id'>;
  waitingUmpires: EntityTable<WaitingAsUmpire, 'id'>;
  waitingServiceJudges: EntityTable<WaitingAsServiceJudge, 'id'>;
};

db.version(1).stores({
  umpires: '++id, lastName',
  courtUmpires: '++id, courtNo, umpireId',
  courtServiceJudges: '++id, courtNo, umpireId',
  settings: '++id',
  waitingUmpires: '++id, order, umpireId',
  waitingServiceJudges: '++id, order, serviceJudgeId'
});

export { db };
