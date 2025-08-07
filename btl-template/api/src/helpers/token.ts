import axios from 'axios';
import { envs } from '../constructs';
import { Token } from '../model';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

export enum TokenKeys {
  vitalReg = 'vitalReg',
}

@Injectable()
export class Tokens {
  async getJwtToken(key: TokenKeys): Promise<string | null> {
    console.log('getJwtToken: ', key);
    let resultToken: Token = await this.getTokenFromDB(key);

    if (resultToken) {
      const expirationTime = new Date(resultToken.expires);
      // Get the current time in UTC
      const currentTime = new Date();
      if (currentTime >= expirationTime) {
        // fetch new token
        const newToken = await this.fetchNewToken(key);
        return newToken;
      } else {
        return resultToken.jwt;
      }
    } else {
      const newToken = await this.fetchNewToken(key);
      return newToken;
    }
  }

  private async fetchNewToken(key: TokenKeys): Promise<string | null> {
    let newToken: string;
    try {
      const data = await this.getTokenFromEndpoint(key);
      if (data) {
        await Token.upsert(
          {
            tokenName: key,
            jwt: data.jwtToken,
            expires: data.expirationDate,
          },
          ['tokenName'],
        );
        newToken = data.jwtToken;
      }
    } catch (error: any) {
      console.log(error.message);
    }
    return newToken;
  }

  private async getTokenFromDB(key: TokenKeys): Promise<Token> {
    return await Token.findOneBy({ tokenName: key });
  }

  private async getTokenFromEndpoint(key: TokenKeys): Promise<any> {
    if (key === TokenKeys.vitalReg) {
      const { data } = await axios.post(
        `${envs.vitalRegEnv.url}/api-client/auth`,
        {
          identity: envs.vitalRegEnv.identity,
          secret: envs.vitalRegEnv.secret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!data) {
        throw new InternalServerErrorException('Error fetching token');
      }
      return { jwtToken: data.access_token, expirationDate: data.expires };
    }
  }
}
