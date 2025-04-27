import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManagerClient({
  region: 'ap-southeast-2',
});

let cachedSecrets = null;

export async function getSecrets() {
  if (cachedSecrets) {
    console.log('Returning cached secrets:', cachedSecrets);
    return cachedSecrets;
  }

  console.log('Fetching secrets from Secrets Manager...');
  console.log('SECRETS_MANAGER_SECRET_NAME:', process.env.SECRETS_MANAGER_SECRET_NAME);

  if (!process.env.SECRETS_MANAGER_SECRET_NAME) {
    throw new Error('SECRETS_MANAGER_SECRET_NAME is not set');
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.SECRETS_MANAGER_SECRET_NAME,
    });
    const data = await secretsManager.send(command);

    console.log('Secrets Manager response:', data);

    if (data.SecretString) {
      cachedSecrets = JSON.parse(data.SecretString);
      console.log('Parsed secrets:', cachedSecrets);
      return cachedSecrets;
    } else {
      throw new Error('Secret not found');
    }
  } catch (error) {
    console.error('Error fetching secrets:', error);
    throw error;
  }
}