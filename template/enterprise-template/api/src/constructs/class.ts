export class HexcodeType {
  count: number;
  caps?: boolean;
  prefix?: string;
  strong?: boolean;
}

export class Rates {
  type: string;
  cost?: number;
  duration?: string;
}

export class FAQ {
  question: string;
}

export class Access {
  key: string;
  actions: string[];
}

export class Permission {
  menus: any[];
  accesses: Access[];
}

export class PaymentInfo {
  amount: number;
  prefix: string;
  currency: string;
}

export class PaymentDetailsDto {
  reference: string;
  currency: string;
  amountToPay: number;
  amount: number;
  charges: number;
}

export class NinObject {
  batchid: string;
  birthcountry: string;
  birthdate: string;
  birthlga: string;
  birthstate: string;
  cardstatus: string;
  centralID: string;
  educationallevel: string;
  emplymentstatus: string;
  firstname: string;
  gender: string;
  heigth: string;
  maritalstatus: string;
  middlename: string;
  nok_address1: string;
  nok_address2: string;
  nok_firstname: string;
  nok_lga: string;
  nok_middlename: string;
  nok_state: string;
  nok_surname: string;
  nok_town: string;
  nspokenlang: string;
  ospokenlang: string;
  pfirstname: string;
  photo: string;
  pmiddlename: string;
  profession: string;
  psurname: string;
  religion: string;
  residence_AdressLine1: string;
  residence_Town: string;
  residence_lga: string;
  residence_state: string;
  residencestatus: string;
  surname: string;
  telephoneno: string;
  title: string;
  trackingId: string;
}
export class Person {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  nin: string;
  email: string;
  dob: Date;
  phoneNumber: string;
  gender: number;
  literacy: number;
  educationLevel: number;
  occupation: number;
  bloodGroup: number;
  genotype: number;
  disease: string;
  originCountry: number;
  originZone: number;
  originState: number;
  originLga: number;
  originTown: string;
  originVillage: string;
  residenceCountry: number;
  residenceZone: number;
  residenceState: number;
  residenceLga: number;
  residenceTown: string;
  residenceAddress1: string;
  residenceAddress2: string;
  civilStatus: number;
  guardianFirstName: string;
  guardianMiddleName?: string;
  guardianLastName: string;
  guardianZone: number;
  guardianState: number;
  guardianLga: number;
  guardianTown: string;
  guardianPhoneNumber: string;
  guardianEmail: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class RegistrationState {
  id: number;
  stateName: string;
  stateCode: string;
}

export class RegistrationLga {
  id: number;
  lgaName: string;
  lgaCode: string;
}

export class SupportingDocuments {
  id: number;
  title: string;
  name: string;
  key: string;
  eTag: string;
  mimeType: string;
}

export class Reason{
  id: number;
  description: string;
}
