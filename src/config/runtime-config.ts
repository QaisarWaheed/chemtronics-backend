import { ConfigService } from '@nestjs/config';

const DEFAULT_JWT_SECRET = 'change-this-jwt-secret-in-production';

function normalizeConfigValue(value?: string): string | undefined {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function getSharedMongoUri(configService: ConfigService): string | undefined {
  return (
    normalizeConfigValue(configService.get<string>('MONGO_URI')) ||
    normalizeConfigValue(configService.get<string>('MONGODB_URI')) ||
    normalizeConfigValue(configService.get<string>('DATABASE_URL'))
  );
}

export function getChemtronicsMongoUri(configService: ConfigService): string {
  const mongoUri =
    normalizeConfigValue(configService.get<string>('MONGO_URI_CHEMTRONICS')) ||
    getSharedMongoUri(configService);

  if (!mongoUri) {
    throw new Error(
      'Missing MongoDB configuration. Set MONGO_URI_CHEMTRONICS or a shared MONGO_URI/MONGODB_URI/DATABASE_URL value.',
    );
  }

  return mongoUri;
}

export function getHydroworxMongoUri(configService: ConfigService): string {
  const mongoUri =
    normalizeConfigValue(configService.get<string>('MONGO_URI_HYDROWORX')) ||
    normalizeConfigValue(configService.get<string>('MONGO_URI2'));

  if (!mongoUri) {
    throw new Error(
      'Missing MongoDB configuration for Hydroworx. Set MONGO_URI_HYDROWORX or MONGO_URI2.',
    );
  }

  return mongoUri;
}

export function getJwtSecret(configService: ConfigService): string {
  return (
    normalizeConfigValue(configService.get<string>('JWT_SECRET')) ||
    normalizeConfigValue(configService.get<string>('JWT_SECRET_KEY')) ||
    DEFAULT_JWT_SECRET
  );
}
