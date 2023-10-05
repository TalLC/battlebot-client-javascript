import { BotConfiguration } from "../config/bot-configuration.js";
import { CommunicationManager } from "./communication-manager.js";

/**
 * Durée d'attente pour les messages envoyant les paramètres du bot
 * @type {number}
 */
const BOT_CONFIG_TIMEOUT = 5000;

/**
 * Gestion du jeux
 */
export class GameManager{
    /**
     * Gestion technique des appels aux serveurs
     * @type {CommunicationManager}
     * @memberof GameManager
     */
    manager;

   

    /**
     * 
     * @param {CommunicationManager} manager Gestion thecnique des appels aux serveurs
     */
    constructor(manager){
        this.manager = manager;
    }

    /**
     * Récupération des paramètres du
     * @param {string} botId identifiant du bot
     * @returns {Promise<BotConfiguration>} la configuration de votre bot
     */
    loadBotConfiguration(botId){
        const configuration = new BotConfiguration();
        console.debug("Récupération de la configuration du bot")
        // Les 4 messages suivants définissent la configuration du bot
        return this.manager.stompConnectAndReadNMessages(botId, 4 , 3 * BOT_CONFIG_TIMEOUT)
                    .then((stompResponse) => {
                        //lecture des HP
                       configuration.health = stompResponse[0].data.value;
                       configuration.movingSpeed = stompResponse[1].data.value;
                       configuration.turningSpeed = stompResponse[2].data.value;
                       configuration.weaponCoolDown = stompResponse[3].data.value;
                    
                       console.info("Configuration du Bot : " + JSON.stringify(configuration));
                       return configuration;
                     })
                    .catch((error) =>{
                        console.error("Récupération des paramètres du bot " +  error);
                    });
    }

    /**
     * 
     * @param {string} botId 
     * @returns {Promise<void>} 
     */
    waitGameStarting(botId){
        return this.manager.stompConnectAndReadOneMessage(botId,60000)
                    .then((stompResponse) => {
                        //Rien à faire juste
                        console.info("Partie démarrée :" + stompResponse.data.value);
                    })
                    .catch((error) =>{
                        console.error("Attente du démarrage de la partie" +  error);
                    });
    }
}