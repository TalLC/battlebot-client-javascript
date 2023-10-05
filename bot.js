import { BotActions } from "./communication/bot-actions.js";
import { CommunicationManager } from "./communication/communication-manager.js";
import { BotConfiguration } from "./config/bot-configuration.js";

export class Bot{
    /**
     * Identifiant du bot
     * @type {string}
     * @memberof Bot
     */
    id;

    /**
     * configuration du bot 
     * @type {BotConfiguration}
     * @memberof Bot
     */
    config;

    /**
     * communication manager
     * @type {CommunicationManager}
     * @memberof Bot
     */
    manager;

    /**
     * liste des actions pour le bot
     * @type {BotActions}
     * @memberof Bot
     */
    action;

    /**
     * Initialisation du bot
     * @param {CommunicationManager} manager gestionnaire de communication avec le serveur
     */
    init(manager){
        if(!this.id){
            throw "Bot id must be defined";
        }
        this.manager = manager;
        this.action = new BotActions(manager, this.id);
    }

    /**
     * 
     * @param {Function} statusListener ecoute du status, la fonction est du type (messageType : string, messageValue : any) : void
     * @param {Function} scannerListener ecoute du status, la fonction est du type (items : array)
     * @param {Function} onClose méthode appelée à la fin du jeux
     */
    startWatchers(statusListener, scannerListener, onClose){
        new Promise((resolve,reject) => {
            let stompClient = this.manager.stompConnectAndListen(this.id, (message) => {
                console.debug("status message : " + JSON.stringify(message));
                console.info(message.msg_type);
                if(message.msg_type === "game_status" && !message.data.value){
                    onClose();
                    console.info("######### Fin de partie #############");
                    //on arrete l'écoute
                    this.manager.closeStompConnexion(stompClient);
                    this.manager.closeMqttConnexion(mqttClient);
                    resolve();
                }else{
                    //on déclenche l'appel
                    statusListener(message.msg_type, message.data.value);
                }
            });

            let mqttClient = this.manager.mqttConnectAndListen(this.id, message => {
                if(message.msg_type === "object_detection"){
                    console.debug("scanner message : " + JSON.stringify(message));
                    scannerListener(message.data);
                }else{
                    console.warn("unknown type scanner message : " + JSON.stringify(message));
                }
            });
        }); 
    }
}