type IPData = {
  ip: string;
  ipNo: string;
  countryShort: string;
  countryLong: string;
  region: string;
  city: string;
  zipCode: string;
  latitude: number;
  longitude: number;
};

declare namespace Express {
  interface Request {
    location?: IPData;
  }
}