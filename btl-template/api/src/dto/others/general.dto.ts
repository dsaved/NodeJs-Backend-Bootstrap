export class CountryDto {
  alpha3: string;
  alpha2: string;
  name: string;
}

export class CityDto {
  country: string;
  code: string;
  name: string;
}
