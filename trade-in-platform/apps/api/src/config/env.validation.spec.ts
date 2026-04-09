import 'reflect-metadata';
import { validate, EnvironmentVariables, Environment } from './env.validation';

describe('Environment Validation', () => {
  const validEnv: Record<string, unknown> = {
    DATABASE_URL: 'mysql://user:password@localhost:3306/tradein',
    JWT_SECRET: 'test-secret-key',
  };

  it('should pass with valid required variables', () => {
    const result = validate(validEnv);

    expect(result).toBeInstanceOf(EnvironmentVariables);
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(result.JWT_SECRET).toBe(validEnv.JWT_SECRET);
  });

  it('should apply defaults for optional variables', () => {
    const result = validate(validEnv);

    expect(result.JWT_EXPIRATION).toBe('24h');
    expect(result.PORT).toBe(3000);
    expect(result.UPLOAD_PATH).toBe('./uploads');
    expect(result.NODE_ENV).toBe(Environment.Development);
  });

  it('should accept all optional variables when provided', () => {
    const fullEnv: Record<string, unknown> = {
      ...validEnv,
      JWT_EXPIRATION: '12h',
      PORT: '8080',
      UPLOAD_PATH: '/tmp/uploads',
      NODE_ENV: 'production',
    };

    const result = validate(fullEnv);

    expect(result.JWT_EXPIRATION).toBe('12h');
    expect(result.PORT).toBe(8080);
    expect(result.UPLOAD_PATH).toBe('/tmp/uploads');
    expect(result.NODE_ENV).toBe(Environment.Production);
  });

  it('should fail when DATABASE_URL is missing', () => {
    const env = { JWT_SECRET: 'secret' };

    expect(() => validate(env)).toThrow('Environment validation failed');
    expect(() => validate(env)).toThrow('DATABASE_URL');
  });

  it('should fail when JWT_SECRET is missing', () => {
    const env = { DATABASE_URL: 'mysql://localhost:3306/db' };

    expect(() => validate(env)).toThrow('Environment validation failed');
    expect(() => validate(env)).toThrow('JWT_SECRET');
  });

  it('should fail when both required variables are missing', () => {
    expect(() => validate({})).toThrow('Environment validation failed');
  });

  it('should fail when NODE_ENV is an invalid value', () => {
    const env = { ...validEnv, NODE_ENV: 'invalid' };

    expect(() => validate(env)).toThrow('Environment validation failed');
  });

  it('should accept all valid NODE_ENV values', () => {
    for (const nodeEnv of ['development', 'staging', 'production']) {
      const result = validate({ ...validEnv, NODE_ENV: nodeEnv });
      expect(result.NODE_ENV).toBe(nodeEnv);
    }
  });
});
