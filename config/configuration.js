//Définition des logs
let logLevels = ["trace", "debug", "info", "log", "warn", "error", "none"];
let shouldLog = (level) => {
  return logLevels.indexOf(level) >= logLevels.indexOf(global.logLevel);
};

let _console=console
global.console = {
  ...global.console,
  log: (message, ...optionalParams) => {
    shouldLog("log")&&_console.log(`INFO  : ${JSON.stringify(message)}`, ...optionalParams);
  },
  info: (message, ...optionalParams) => {
    shouldLog("info")&&_console.log(`INFO  : ${JSON.stringify(message)}`, ...optionalParams);
  },
  warn: (message, ...optionalParams) => {
    shouldLog("warn") && _console.warn(`WARN  : ${JSON.stringify(message)}`, ...optionalParams);
  },
  error: (message, ...optionalParams) => {
    shouldLog("error") && _console.error(`ERROR : ${JSON.stringify(message)}`, ...optionalParams);
  },
  debug: (message, ...optionalParams) => {
    shouldLog("debug") && _console.debug(`DEBUG : ${JSON.stringify(message)}`, ...optionalParams);
  },
  trace: (message, ...optionalParams) => {
    shouldLog("trace") && _console.debug(`TRACE : ${JSON.stringify(message)}`, ...optionalParams);
  },
};

const DEFAULT_HOST = "localhost";

/**
 * Configutation pour les connexions
 */
export class Configuration{
    /**
     * IP du serveur REST Battlebot
     * @type {string}
     * @memberof Configuration
     */
    restServer = DEFAULT_HOST;
    /**
     * Port du serveur REST Battlebot
     * @type {string}
     * @memberof Configuration
     */
    restPort = 8000;
     /**
     * IP du serveur MQTT Battlebot
     * @type {number}
     * @memberof Configuration
     */
    mqttServer = DEFAULT_HOST;
     /**
     * Port du serveur MQTT Battlebot
     * @type {string}
     * @memberof Configuration
     */
    mqttPort = 1883;
     /**
     * Identifiant du serveur MQTT
     * @type {string}
     * @memberof Configuration
     */
    mqttUsername = "user";
      /**
     * Authentifiant du serveur MQTT
     * @type {string}
     * @memberof Configuration
     */
    mqttPassword = "password";
     /**
     * IP du serveur STOMP Battlebot
     * @type {string}
     * @memberof Configuration
     */
    stompServer = DEFAULT_HOST;
     /**
     * Port du serveur REST Battlebot
     * @type {number}
     * @memberof Configuration
     */
    stompPort = 61614;
    /**
     * Identifiant du serveur STOMP
     * @type {string}
     * @memberof Configuration
     */
    stompUserName= "user";
     /**
     * Autentifiant du serveur STOMP
     * @type {string}
     * @memberof Configuration
     */
    stompPassword= "password";

}