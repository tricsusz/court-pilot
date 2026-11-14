import { db } from 'db';

/** Add a sample roster once, preserving existing officials and queue order. */
export async function seedDemoData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.umpires, db.settings, db.waitingUmpires, db.waitingServiceJudges],
    async () => {
      if (await db.umpires.where('lastName').equals('Demo 01').count()) return;

      const settings = await db.settings.get(1);
      const withServiceJudge = settings?.withServiceJudge ?? true;
      const umpireOrder =
        (await db.waitingUmpires.orderBy('order').last())?.order ?? 0;
      const judgeOrder =
        (await db.waitingServiceJudges.orderBy('order').last())?.order ?? 0;
      const names = [
        'Anna',
        'Daniel',
        'Eszter',
        'Mark',
        'Lilla',
        'Peter',
        'Nora',
        'David',
        'Julia',
        'Adam',
        'Sara',
        'Bence',
        'Emma',
        'Mate',
        'Laura',
        'Oliver',
        'Hanna',
        'Balazs',
        'Zsofia',
        'Kristof'
      ];

      for (const [index, firstName] of names.entries()) {
        const id = await db.umpires.add({
          firstName,
          lastName: `Demo ${String(index + 1).padStart(2, '0')}`,
          country: 'HU',
          gender: index % 2 === 0 ? 'W' : 'M'
        });
        if (index < 8 || (!withServiceJudge && index < 14)) {
          await db.waitingUmpires.add({
            umpireId: id,
            order: umpireOrder + index + 1
          });
        } else if (withServiceJudge && index < 14) {
          await db.waitingServiceJudges.add({
            serviceJudgeId: id,
            order: judgeOrder + index - 7
          });
        }
      }
    }
  );
}
