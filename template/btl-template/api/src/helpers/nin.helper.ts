require('dotenv').config();
import {
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import axios from 'axios';
import { classes } from '../constructs';
import { TestNin } from 'src/model';
import { Repository } from 'typeorm';
const { ...env } = process.env;
export default class NinHelper {
  private nin: string;

  constructor(private readonly testNinRepository: Repository<TestNin>) {
    if (!env.GO_TO_API_URL || !env.GO_TO_API_KEY) {
      throw new InternalServerErrorException(
        'Environment variables GO_TO_API_URL or GO_TO_API_KEY are not defined',
      );
    }
  }

  /**
   * Create or update a NIN record in the database.
   * @param nin - National Identification Number
   * @param ninData - NIN data object
   */
  async createOrUpdateNin(
    nin: string,
    ninData: classes.NinObject,
  ): Promise<boolean> {
    try {
      // Use save() for upsert functionality
      const result = await this.testNinRepository.save({
        nin, // Unique identifier
        ninData, // Data to insert or update
      });

      // Return true if the operation is successful
      return !!result;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to create or update NIN record: ${error.message}`,
      );
    }
  }

  /**
   * Sets the NIN value for subsequent operations.
   * @param nin - National Identification Number
   */
  setNin(nin: string): this {
    if (!nin) {
      throw new NotAcceptableException('NIN value cannot be empty.');
    }
    this.nin = nin;
    return this;
  }

  /**
   * Fetches NIN data either from the database (in development) or an external API.
   * @returns NIN data object
   */
  async fetchNinData(): Promise<classes.NinObject> {
    if (!this.nin) {
      throw new NotAcceptableException(
        'Please provide a valid NIN before calling this method.',
      );
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        // Fetch from the local database
        const ninRecord = await this.testNinRepository.findOne({
          where: { nin: this.nin },
        });

        if (!ninRecord) {
          throw new NotAcceptableException(
            `NIN record not found for: ${this.nin}`,
          );
        }

        return ninRecord.ninData;
      }

      // Fetch from external API
      const response = await axios.get(
        `${process.env.GO_TO_API_URL}/vrequest`,
        {
          params: {
            request: 'nin',
            nin: this.nin,
            key: process.env.GO_TO_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('Error during NIN API request:', error);
      throw new InternalServerErrorException(
        `Failed to fetch NIN data: ${error.message}`,
      );
    }
  }
}
