/* eslint-disable @typescript-eslint/no-unused-vars */
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Group } from '../model';

export default class GroupSeedeer implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Group);

    if ((await repository.count()) < 1) {
      await repository.insert([{ groupName: 'Administrators', scopeLevel: 1 }]);
    }

    console.log('Group seeded successfully!');
  }
}
