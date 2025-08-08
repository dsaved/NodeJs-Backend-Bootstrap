import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../model';
import { enums, envs } from '../constructs';
import * as bcrypt from 'bcryptjs';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User);

    if ((await repository.count()) < 1) {
      await repository.insert([
        {
          firstName: 'System',
          lastName: 'Administrator',
          middleName: null,
          gender: enums.GenderEnum.FEMALE,
          phoneNumber: '01234567899',
          emailAddress: 'admin@example.com',
          password: await bcrypt.hash(envs.appEnv.adminSecret, 10),
        },
      ]);
    }
    console.log('System Administrator user seeded successfully!');
  }
}
