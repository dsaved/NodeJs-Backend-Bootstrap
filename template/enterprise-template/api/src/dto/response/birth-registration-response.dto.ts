export class RegistrationWardDto {
  id: number;
  wardName: string;
}

export class CountryDto {
  id: number;
  countryName: string;
  nationality: string;
}

export class StateDto {
  id: number;
  stateCode: string;
  stateName: string;
}

export class LgaDto {
  id: number;
  lgaName: string;
  lgaCode: string;
}

export class AnthropometricDto {
  id: number;
  weight: string;
  height: string;
  lessThan2Point5kgAtBirth: boolean;
}

export class BirthRegistrationResponseDto {
  id: number;
  certificateNumber: string;
  immunizationCertificateNumber: string;
  childFirstName: string;
  childSurname: string;
  childMiddleName: string;
  birthDate: string;
  childGender: number;
  motherFirstName: string;
  motherSurname: string;
  motherMiddleName: string;
  motherMaidenName: string;
  motherAgeAtChildBirth: string;
  fatherFirstName: string;
  fatherSurname: string;
  fatherMiddleName: string;
  fatherMaidenName: string;
  fatherAgeAtChildBirth: string;
  survivingChildren: string;
  deadChildren: string;
  isBabyTwin: boolean;
  isBabyBottleFed: boolean;
  motherNeedFamilySupport: boolean;
  lessThan25AtBirth: boolean;
  underweightSiblings: boolean;
  anyUnderlyingMedicalCondition: boolean;
  underlyingMedicalCondition: string;
  residenceAddress: string;
  contactEmail: string;
  contactPhone1: string;
  contactPhone2: string;
  registrationWard: RegistrationWardDto;
  childOriginCountry: CountryDto;
  childOriginState: StateDto;
  childOriginLga: LgaDto;
  motherOriginCountry: CountryDto;
  motherOriginState: StateDto;
  motherOriginLga: LgaDto;
  fatherOriginCountry: CountryDto;
  fatherOriginState: StateDto;
  fatherOriginLga: LgaDto;
  residenceState: StateDto;
  residenceLga: LgaDto;
  anthropometrics: AnthropometricDto[];

  constructor(birthRegistration: any) {
    this.id = birthRegistration.id;
    this.certificateNumber = birthRegistration.certificateNumber;
    this.immunizationCertificateNumber =
      birthRegistration.immunizationCertificateNumber;
    this.childFirstName = birthRegistration.childFirstName;
    this.childSurname = birthRegistration.childSurname;
    this.childMiddleName = birthRegistration.childMiddleName;
    this.birthDate = birthRegistration.birthDate;
    this.childGender = birthRegistration.childGender;
    this.motherFirstName = birthRegistration.motherFirstName;
    this.motherSurname = birthRegistration.motherSurname;
    this.motherMiddleName = birthRegistration.motherMiddleName;
    this.motherMaidenName = birthRegistration.motherMaidenName;
    this.motherAgeAtChildBirth = birthRegistration.motherAgeAtChildBirth;
    this.fatherFirstName = birthRegistration.fatherFirstName;
    this.fatherSurname = birthRegistration.fatherSurname;
    this.fatherMiddleName = birthRegistration.fatherMiddleName;
    this.fatherMaidenName = birthRegistration.fatherMaidenName;
    this.fatherAgeAtChildBirth = birthRegistration.fatherAgeAtChildBirth;
    this.survivingChildren = birthRegistration.survivingChildren;
    this.deadChildren = birthRegistration.deadChildren;
    this.isBabyTwin = birthRegistration.isBabyTwin;
    this.isBabyBottleFed = birthRegistration.isBabyBottleFed;
    this.motherNeedFamilySupport = birthRegistration.motherNeedFamilySupport;
    this.lessThan25AtBirth = birthRegistration.lessThan25AtBirth;
    this.underweightSiblings = birthRegistration.underweightSiblings;
    this.anyUnderlyingMedicalCondition =
      birthRegistration.anyUnderlyingMedicalCondition;
    this.underlyingMedicalCondition =
      birthRegistration.underlyingMedicalCondition;
    this.residenceAddress = birthRegistration.residenceAddress;
    this.contactEmail = birthRegistration.contactEmail;
    this.contactPhone1 = birthRegistration.contactPhone1;
    this.contactPhone2 = birthRegistration.contactPhone2;

    // Assign objects
    this.registrationWard = {
      id: birthRegistration?.registrationWard?.id,
      wardName: birthRegistration?.registrationWard?.wardName,
    };
    this.childOriginCountry = {
      id: birthRegistration?.childOriginCountry?.id,
      countryName: birthRegistration?.childOriginCountry?.countryName,
      nationality: birthRegistration?.childOriginCountry?.nationality,
    };
    this.childOriginState = {
      id: birthRegistration?.childOriginState?.id,
      stateName: birthRegistration?.childOriginState?.stateName,
      stateCode: birthRegistration?.childOriginState?.stateCode,
    };

    this.childOriginLga = {
      id: birthRegistration?.childOriginLga?.id,
      lgaName: birthRegistration?.childOriginLga?.lgaName,
      lgaCode: birthRegistration?.childOriginLga?.lgaCode,
    };

    this.motherOriginCountry = {
      id: birthRegistration?.motherOriginCountry?.id,
      countryName: birthRegistration?.motherOriginCountry?.countryName,
      nationality: birthRegistration?.motherOriginCountry?.nationality,
    };

    this.motherOriginState = {
      id: birthRegistration?.motherOriginState?.id,
      stateName: birthRegistration?.motherOriginState?.stateName,
      stateCode: birthRegistration?.motherOriginState?.stateCode,
    };

    this.motherOriginLga = {
      id: birthRegistration?.motherOriginLga?.id,
      lgaName: birthRegistration?.motherOriginLga?.lgaName,
      lgaCode: birthRegistration?.motherOriginLga?.lgaCode,
    };

    this.fatherOriginCountry = {
      id: birthRegistration?.fatherOriginCountry?.id,
      countryName: birthRegistration?.fatherOriginCountry?.countryName,
      nationality: birthRegistration?.fatherOriginCountry?.nationality,
    };

    this.fatherOriginState = {
      id: birthRegistration?.fatherOriginState?.id,
      stateName: birthRegistration?.fatherOriginState?.stateName,
      stateCode: birthRegistration?.fatherOriginState?.stateCode,
    };

    this.fatherOriginLga = {
      id: birthRegistration?.fatherOriginLga?.id,
      lgaName: birthRegistration?.fatherOriginLga?.lgaName,
      lgaCode: birthRegistration?.fatherOriginLga?.lgaCode,
    };

    this.residenceState = {
      id: birthRegistration?.residenceState?.id,
      stateName: birthRegistration?.residenceState?.stateName,
      stateCode: birthRegistration?.residenceState?.stateCode,
    };
    this.residenceLga = {
      id: birthRegistration?.residenceLga?.id,
      lgaName: birthRegistration?.residenceLga?.lgaName,
      lgaCode: birthRegistration?.residenceLga?.lgaCode,
    };

    // Assign array
    this.anthropometrics = birthRegistration.anthropometrics.map(
      (anthropometric) => {
        return {
          id: +anthropometric.id,
          weight: +anthropometric.weight,
          height: +anthropometric.height,
          lessThan2Point5kgAtBirth: anthropometric.lessThan2Point5kgAtBirth,
        };
      },
    );
  }
}
