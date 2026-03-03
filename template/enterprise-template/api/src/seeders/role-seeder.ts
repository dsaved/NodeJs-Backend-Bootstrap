/* eslint-disable @typescript-eslint/no-unused-vars */
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../model';

export default class RoleSeedeer implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Role);

    if ((await repository.count()) < 1) {
      await repository.insert([
        { roleName: 'Administrator', group: { id: 1 } },
      ]);
    }

    console.log('Roles seeded successfully!');
  }
}
