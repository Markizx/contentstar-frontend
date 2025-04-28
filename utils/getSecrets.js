import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManagerClient({
  region: 'ap-southeast-2', // Укажи регион, где хранятся твои секреты
});

export async function getSecrets() {
  try {
    const command = new GetSecretValueCommand({
      SecretId: process.env.SECRETS_MANAGER_SECRET_NAME || 'contentstar-secrets',
    });
    const data = await secretsManager.send(command);
    if (data.SecretString) {
      return JSON.parse(data.SecretString);
    }
    throw new Error('SecretString is empty');
  } catch (error) {
    console.error('Error retrieving secrets:', error);
    throw error;
  }
}