import AWS from 'aws-sdk';

const secretsManager = new AWS.SecretsManager({
  region: 'YOUR_REGION', // Например, 'us-east-1'
});

let cachedSecrets = null;

export async function getSecrets() {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    const data = await secretsManager
      .getSecretValue({ SecretId: process.env.SECRETS_MANAGER_SECRET_NAME })
      .promise();

    if ('SecretString' in data) {
      cachedSecrets = JSON.parse(data.SecretString);
      return cachedSecrets;
    } else {
      throw new Error('Secret not found');
    }
  } catch (error) {
    console.error('Error fetching secrets:', error);
    throw error;
  }
}