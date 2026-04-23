export class Logger {
  static info(message: string): void {
    console.log(`[INFO]  ${new Date().toISOString()} - ${message}`);
  }

  static step(message: string): void {
    console.log(`[STEP]  ${new Date().toISOString()} - ${message}`);
  }

  static error(message: string, error?: Error): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error(error);
    }
  }

  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
}
