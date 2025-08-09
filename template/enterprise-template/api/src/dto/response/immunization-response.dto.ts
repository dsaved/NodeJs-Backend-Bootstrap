import { enums } from 'src/constructs';

export class ImmunizationStatisticResponseDto {
  count: number;
}

export class ImmunizationResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  immunizationCertificateNumber: string;
  childGender: string;
  birthDate: string;
  status: string;
  createdAt: Date;

  constructor(data: any) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.middleName = data.middleName;
    this.immunizationCertificateNumber = data.immunizationCertificateNumber;
    this.childGender = enums.GenderEnumNum[data.childGender];
    this.birthDate = new Date(data.birthDate).toISOString().split('T')[0];
    this.createdAt = data.createdAt;
  }
}

export class ImmunizationHistoryResponseDto {
  id: number;
  vaccineName: string;
  dayOfAdministration: string;
  dayAdministered: string;
  windowOfAdministration: string;
  dateAdministered: Date;

  constructor(data: any) {
    this.id = data.id;
    this.vaccineName = data?.vaccinationSchedule?.vaccineName;
    this.dayOfAdministration = data?.vaccinationSchedule?.dayOfAdministration;
    this.windowOfAdministration = data?.vaccinationSchedule?.windowOfAdministration;
    this.dayAdministered = data.dayOfAdministration;
    this.dateAdministered = data.createdAt;
  }
}

