import { SQS } from '@aws-sdk/client-sqs';
import { awsEnv } from '../constructs/env';

const enqueue = async (payload) => {
  try {
    const endpoint = `https://sqs.${awsEnv.region}.amazonaws.com/${awsEnv.accountId}/${awsEnv.notificationsQueueName}`;
    const sqs = new SQS({
      apiVersion: '2012-11-05',
      region: awsEnv.region,
      credentials: {
        accessKeyId: awsEnv.accessKeyId,
        secretAccessKey: awsEnv.secret,
      },
      endpoint,
    });
    console.log(payload);
    console.log('INSERTING IN QUEUE');
    const params = {
      MessageBody: JSON.stringify(payload),
      QueueUrl: endpoint,
    };

    console.log('QueueUrl', params.QueueUrl);
    const result = await sqs.sendMessage(params);
    console.log('Enqueue success', result.MessageId);
    return result;
  } catch (e) {
    console.log('Error while enqueue message', e);
  }
};

export const sendNotification = async ({ id, type }): Promise<void> => {
  const payload = {
    type,
    emailId: id,
  };

  await enqueue(payload);
};
