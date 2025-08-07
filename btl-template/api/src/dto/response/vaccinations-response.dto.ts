import { enums } from 'src/constructs';

export class Vaccinations {
  id: number;
  vaccineName: string;
  vaccineType: string;
  dosage: string;
  routesOfAdministration: string;
  dayOfAdministration: number;
  windowOfAdministration: number | null;
  administered: boolean;
  dateOfAdministration: string;
  dateOfAdministrationEnd: string;
  dateAdministered: Date;

  constructor(data: any, birthDate: Date) {
    this.id = data.id;
    this.vaccineName = data.vaccinename;
    this.vaccineType = data.vaccinetype;
    this.dosage = data.dosage;
    this.routesOfAdministration = data.routesofadministration;
    this.dayOfAdministration = +data.dayofadministration;
    this.windowOfAdministration = data.windowofadministration
      ? +data.windowofadministration
      : null;
    this.administered = Boolean(data.administered);

    // Calculate dateOfAdministration
    const administrationDate = new Date(birthDate);
    administrationDate.setDate(birthDate.getDate() + (this.dayOfAdministration - 1));

    // Calculate dateOfAdministrationEnd
    const administrationEndDate = new Date(administrationDate);
    if (this.windowOfAdministration) {
      administrationEndDate.setDate(
        administrationDate.getDate() + (this.windowOfAdministration - 1),
      );
    }

    // Format dates as YYYY-MM-DD (string)
    this.dateOfAdministration = this.formatDate(administrationDate);
    this.dateOfAdministrationEnd = this.formatDate(administrationEndDate);
    this.dateAdministered = data.dateadministered;
  }

  private formatDate(date: Date): string {
    // Extracts YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }
}

export class VaccinationStatisticCount {
  totalRegisteredChildren: number;
  ongoingImmunizations: number;
  completedImmunizations: number;
  uncompletedImmunizations: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
export class VaccinationStatisticGenderDistribution {
  result: Record<
    string,
    {
      totalRegisteredChildren: number;
      ongoingImmunizations: number;
      completedImmunizations: number;
      uncompletedImmunizations: number;
    }
  >;

  constructor(data: any) {
    this.result = {};
    console.log(data);

    // Helper function to populate data
    const populateData = (
      entries: { gender: string; count: string }[],
      key: keyof (typeof this.result)[string],
    ) => {
      for (const entry of entries) {
        // Convert string '0' or '1' to enum representation
        const genderKey = enums.genderStatusFromNum(+entry.gender);
        if (!this.result[genderKey]) {
          // Initialize gender if not present
          this.result[genderKey] = {
            totalRegisteredChildren: 0,
            ongoingImmunizations: 0,
            completedImmunizations: 0,
            uncompletedImmunizations: 0,
          };
        }
        this.result[genderKey][key] = parseInt(entry.count, 10);
      }
    };

    // Populate DTO with actual data
    populateData(data.totalRegisteredChildren, 'totalRegisteredChildren');
    populateData(data.ongoingImmunizations, 'ongoingImmunizations');
    populateData(data.completedImmunizations, 'completedImmunizations');
    populateData(data.uncompletedImmunizations, 'uncompletedImmunizations');
  }
}
export class VaccinationStatisticAgeDistribution {
  result: Record<
    string,
    {
      totalRegisteredChildren: number;
      ongoingImmunizations: number;
      completedImmunizations: number;
      uncompletedImmunizations: number;
    }
  >;

  constructor(data: any) {
    const ageGroups = ['0-2', '2-4', '4-6'];

    // Initialize age groups with default values
    this.result = {};
    for (const ageGroup of ageGroups) {
      this.result[ageGroup] = {
        totalRegisteredChildren: 0,
        ongoingImmunizations: 0,
        completedImmunizations: 0,
        uncompletedImmunizations: 0,
      };
    }

    // Helper function to populate data
    const populateData = (
      entries: { ageGroup: string; count: string }[],
      key: keyof (typeof this.result)['0-2'],
    ) => {
      for (const entry of entries) {
        if (this.result[entry.ageGroup]) {
          this.result[entry.ageGroup][key] = parseInt(entry.count, 10);
        }
      }
    };

    // Populate DTO with actual data
    populateData(data.totalRegisteredChildren, 'totalRegisteredChildren');
    populateData(data.ongoingImmunizations, 'ongoingImmunizations');
    populateData(data.completedImmunizations, 'completedImmunizations');
    populateData(data.uncompletedImmunizations, 'uncompletedImmunizations');
  }
}

export class VaccinationStatisticRegistrationByGender {
  totalChildren: number;
  female: number;
  male: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
