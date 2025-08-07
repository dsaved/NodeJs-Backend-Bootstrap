import { BaseRequestDto } from "./base-request-dto";

export class ListStatebyCountryRequestDto extends BaseRequestDto{
    countryId: number;
}

export class ListStateByZoneRequestDto extends BaseRequestDto{
    zoneId: number;
}

export class ListLgabyStateRequestDto extends BaseRequestDto{
    stateId: number;
}

export class ListWardByLgaRequestDto extends BaseRequestDto{
    lgaId: number;
}