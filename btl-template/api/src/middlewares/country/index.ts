import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios'; // Import axios
import { envs } from '../../constructs';

@Injectable()
export class CountryMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let ipAddress = req.ip; // get the client's IP address from the request object
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = xForwardedFor.toString().split(',');
      ipAddress = ips[0].trim();
    }

    try {
      const response = await axios.get(`${envs.ipLocation.url}/${ipAddress}`, {
        headers: {'X-API-Key': envs.ipLocation.IpKey}
      });
      req.location = response.data; // store the result in the request object
    } catch (error) {
      console.error('Error fetching IP data:', error);
      req.location = null; // Handle error gracefully
    }

    next();
  }
}
