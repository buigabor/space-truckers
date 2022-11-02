import { Logger } from '@babylonjs/core/Misc/logger';
class ConsoleProxy {
  constructor() {}

  logInfo(message: string) {
    Logger.Log(message);
  }

  logWarning(message: string) {
    Logger.Warn(message);
  }

  logError(message: string) {
    Logger.Error(message);
  }

  logFatal(message: string) {
    Logger.Error('FATAL: ' + message);
  }

  flushBuffer() {
    Logger.ClearLogCache();
  }
}
const theProxy = new ConsoleProxy();

export default theProxy;
