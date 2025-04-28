import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Настройка клиента Secrets Manager с новыми именами переменных
const secretsManager = new SecretsManagerClient({
  region: process.env.REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
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