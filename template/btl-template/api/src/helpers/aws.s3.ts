import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envs } from '../constructs';
import {
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import crypto from 'crypto';

class AttachmentUtils {
  private readonly s3: S3Client;
  private readonly expiresIn: number = 604800; // 6hours

  constructor() {
    this.s3 = new S3Client({
      region: envs.awsEnv.region,
      credentials: {
        accessKeyId: envs.awsEnv.accessKeyId,
        secretAccessKey: envs.awsEnv.secret,
      },
    });
  }

  async getFile(key: string) {
    const input = {
      Bucket: envs.awsEnv.s3Bucket,
      Key: key,
    };
    const command = new GetObjectCommand(input);
    return await this.s3.send(command);
  }

  imageUrl(filename: string): string {
    return `https://${envs.awsEnv.s3Bucket}.s3.amazonaws.com/${filename}`;
  }

  async generateUploadUrl(
    fileName: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const md5Hash = crypto.createHash('md5').update(fileName).digest('hex');
      const fileNameWithUuid = `${md5Hash}-${fileName}`;
      const params = {
        Bucket: envs.awsEnv.s3Bucket,
        Key: fileNameWithUuid,
      };

      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, {
        expiresIn: 900,
      });

      return { url, key: fileNameWithUuid };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Error generating upload URL');
    }
  }

  async getETag(fileKey: string): Promise<string | undefined> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: envs.awsEnv.s3Bucket,
        Key: fileKey,
      });
      const headData = await this.s3.send(headCommand);
      return headData.ETag;
    } catch (error) {
      console.error('Error retrieving ETag:', error);
      return undefined;
    }
  }

  async getPresignedUrl(filename: string): Promise<string> {
    try {
      const params = {
        Bucket: envs.awsEnv.s3Bucket,
        Key: filename,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, {
        expiresIn: this.expiresIn,
      });

      return url;
    } catch (error) {
      console.error('Error generating Presigned URL:', error);
      throw new Error('Error generating Presigned URL');
    }
  }

  // Function to upload a base64 string to S3
  async uploadBase64(param: {
    base64String: string;
    objectKey: string;
    stringContent?: boolean;
  }) {
    try {
      // param.stringContent is set to true the content will be uploaded as it is else the buffer will be uploaded
      const body = param.stringContent
        ? param.base64String
        : Buffer.from(param.base64String, 'base64');

      const uploadParams = {
        Bucket: envs.awsEnv.s3Bucket,
        Key: param.objectKey,
        Body: body,
      };

      const data = await this.s3.send(new PutObjectCommand(uploadParams));
      console.log('File uploaded successfully!');
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  }

  // Function to check if a file with the same MD5 exists
  async checkDuplicateByTag(bucketName: string, fileHash: string, key: string) {
    try {
      const taggingParams = { Bucket: bucketName, Key: key };
      const tagCommand = new GetObjectTaggingCommand(taggingParams);
      const tagData = await this.s3.send(tagCommand);

      const existingHash = tagData.TagSet.find(
        (tag) => tag.Key === 'fileHash',
      )?.Value;

      return existingHash === fileHash;
    } catch (error) {
      return false; // Assume file doesn't exist if we get a 404
    }
  }

  // Function to upload a file to S3
  async uploadFile(
    base64String: string,
    mimeType: string,
    fileName: string,
  ): Promise<{ key: string; eTag: string }> {
    try {
      const body = Buffer.from(base64String, 'base64');
      const md5Hash = crypto.createHash('md5').update(body).digest('hex');
      const fileNameWithUuid = `${md5Hash}-${fileName}`;

      const isDuplicate = await this.checkDuplicateByTag(
        envs.awsEnv.s3Bucket,
        md5Hash,
        fileNameWithUuid,
      );
      if (isDuplicate) {
        console.log('Duplicate file detected, skipping upload.');
        throw new NotAcceptableException(
          'Duplicate file detected, skipping upload.',
        );
      }

      const uploadParams = {
        Bucket: envs.awsEnv.s3Bucket,
        Key: fileNameWithUuid,
        Body: body,
        ContentType: mimeType,
        Tagging: `fileHash=${md5Hash}`,
      };

      const response = await this.s3.send(new PutObjectCommand(uploadParams));
      console.log('File uploaded successfully!');
      return { key: fileNameWithUuid, eTag: response.ETag };
    } catch (err) {
      console.error('Error uploading file:', err);
      throw new InternalServerErrorException(err);
    }
  }

  // New function to delete a file from S3
  async deleteFile(key: string): Promise<boolean> {
    try {
      const deleteParams = {
        Bucket: envs.awsEnv.s3Bucket,
        Key: key,
      };
      const command = new DeleteObjectCommand(deleteParams);
      await this.s3.send(command);
      console.log('File deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Error deleting file');
    }
  }
}

export default new AttachmentUtils();
