export class PhcResponseDto {
  id: number;
  phcName: string;
  isActive: boolean;
  state: any;
  lga: any;
  ward: any;
  totalImmunization: number;
  completedImmunization: number;
  pendingImmunization: number;
  createdAt: Date;
  updatedAt: Date;
  registrationCount: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
