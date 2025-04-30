import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

   const secretsManager = new SecretsManagerClient({
     region: process.env.AWS_REGION || 'ap-southeast-2',
   });

   export async function getSecrets() {
     try {
       const response = await secretsManager.send(
         new GetSecretValueCommand({ SecretId: process.env.SECRETS_MANAGER_SECRET_NAME })
       );
       return JSON.parse(response.SecretString);
     } catch (error) {
       console.error('Error fetching secrets:', error);
       throw new Error('Failed to fetch secrets');
     }
   }