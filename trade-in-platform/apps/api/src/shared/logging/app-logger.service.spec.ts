import { AppLogger } from './app-logger.service';

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger();
    // Silence console output during tests
    jest
      .spyOn(logger.getWinstonLogger().transports[0], 'log')
      .mockImplementation((_info: unknown, callback: () => void) => callback());
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a Winston logger instance', () => {
    expect(logger.getWinstonLogger()).toBeDefined();
  });

  it('should call Winston info on log()', () => {
    const spy = jest.spyOn(logger.getWinstonLogger(), 'info');

    logger.log('test message', 'TestContext');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'test message',
        context: 'TestContext',
      }),
    );
  });

  it('should call Winston error on error()', () => {
    const spy = jest.spyOn(logger.getWinstonLogger(), 'error');

    logger.error('error message', 'stack trace', 'TestContext');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'error message',
        trace: 'stack trace',
        context: 'TestContext',
      }),
    );
  });

  it('should call Winston warn on warn()', () => {
    const spy = jest.spyOn(logger.getWinstonLogger(), 'warn');

    logger.warn('warn message', 'TestContext');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'warn message',
        context: 'TestContext',
      }),
    );
  });

  it('should call Winston debug on debug()', () => {
    const spy = jest.spyOn(logger.getWinstonLogger(), 'debug');

    logger.debug('debug message', 'TestContext');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'debug message',
        context: 'TestContext',
      }),
    );
  });

  it('should call Winston verbose on verbose()', () => {
    const spy = jest.spyOn(logger.getWinstonLogger(), 'verbose');

    logger.verbose('verbose message', 'TestContext');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'verbose message',
        context: 'TestContext',
      }),
    );
  });
});
