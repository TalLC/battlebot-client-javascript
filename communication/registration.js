import { CommunicationManager } from "./communication-manager.js";
import { EnrollRequest } from "../client/message/command/enroll-request.js";
import { CheckConnectionRequest } from "../client/message/command/check-connection-request.js";
/**
 * Gestion de l'ensemble des échanges REST avec le serveur
 */
export class Registration{
    /**
     * Gestion technique des appels aux serveurs
     * @type {CommunicationManager}
     * @memberof Registration
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
     * Enregistrement du bot pour la partie
     * @param {string} teamId identifiant de l'équipe
     * @param {string} botName identfiant du bot (nom)
     * @returns {Promise} identifiant du bot ou null si l'enregistrement c'est mal passé
     */
    registerBot(teamId, botName){
        return new Promise((resolve,reject) => {
            let request = new EnrollRequest(teamId, botName);
            //Déclaration du bot
            this.manager.httpPost("/bots/action/register", request, (data, response) => {
                if(data.status === 'ok'){
                    console.info(`bot enregistrer sous l'id ${data.bot_id}`);
                    resolve(data.bot_id);

                }else{
                    console.error(`Demande d'enregistrement du bot (nom : ${botName}, team : ${teamId}) : ${data.message}`);
                    reject();
                }

            }).on('error', function(err){
                console.error(`Demande d'enregistrement du bot (nom : ${botName}, team : ${teamId})`, err);
                reject();
            });
        });
    }

    /**
     * Phase enrollement : récupératin de l'identifiant d'enregistrement REST
     * @param {string} botId identifiant du bot
     * @returns {Promise<string>} récupération de l'identifant d'enregistrement
     */
    registrationId(botId){
        console.info("Récupération de l'identifiant d'enregistrement RET...");
        return new Promise((resolve,reject) => {
            this.manager.httpGet(`/bots/${botId}/action/request_connection`, (data, response) => {
                if(data.status === 'ok'){
                    console.info(`identifiant d'enregistrement REST ${data.request_id}`);
                    resolve(data.request_id);
                }else{
                    console.error(`Récupération identifiant d'enregistrement (Bot ID : ${botId} : ${data.message}`);
                    reject();
                }
            }).on('error', function(err){
                console.error(`Récupération identifiant d'enregistrement (Bot ID : ${botId}`, err);
                reject();
            });
        });
    }

    /**
     * Phase enrollement : récupératin de l'identifiant d'enregistrement STOMP
     * @param {string} botId identifiant du bot
     * @returns {Promise<string>} récupération de l'identifant d'enregistrement
     */
    checkStompConnexions(botId){
        console.info("Récupération de l'identifiant d'enregistrement STOMP...");
        return this.manager.stompConnectAndReadOneMessage(botId,1000)
                    .then((stompResponse) => {
                        const stompId = stompResponse.data.value;
                        console.info(`identifiant d'enregistrement STOMP ${stompId}`);
                        return stompId;
                    }).catch((error) =>{
                        console.error("Récupération de l'identifiant STOMP" +  error);
                    });
    }

    /**
     * Phase enrollement : récupération de l'identifiant d'enregistrement MQTT
     * @param {string} botId identifiant du bot
     * @returns {Promise<string>} récupération de l'identifant d'enregistrement
     */
    checkMQTTConnexions(botId){
        console.info("Récupération de l'identifiant d'enregistrement MQTT...");
        return this.manager.mqttConnectAndReadOneMessage(botId,1000)
                    .then((mqttResponse) => {
                        const mqttId = mqttResponse.data.value;
                        console.info(`identifiant d'enregistrement MQTT ${mqttId}`);
                        return mqttId;
                    }).catch((error) =>{
                        console.error("Récupération de l'identifiant MQTT" +  error);
                    });
    }

    /**
     * Vérification de l'ensemble des connexions REST, STOMP, MQTT
     * @param {string} botId identifiant du BOT
     * @returns {Promise<CheckConnectionRequest>} ensemble des identifiants de connexion
     */
    checkConnexions(botId){
        console.info("Vérification de l'ensemble des connexions.");
        let regIds = new CheckConnectionRequest();
        return this.registrationId(botId)
                    .then( (restId) => {
                        regIds.rest_id = restId;
                        return this.checkStompConnexions(botId);
                    })
                    .then( (stompId) => {
                        regIds.stomp_id = stompId;
                        return this.checkMQTTConnexions(botId);
                    })
                    .then( (mqttId) => {
                        regIds.mqtt_id = mqttId;
                        //on a tous les ID on va les envoyé pour finaliser l'enrollement
                        return new Promise((resolve,reject) => { 
                            console.info("Finalisation de l'enrollement ...");
                            this.manager.httpPatch(`/bots/${botId}/action/check_connection`, regIds, (data, response) => {
                                if(data.status === 'ok'){
                                    console.info("Enrollement finalisé");
                                    resolve();
                                }else{
                                    console.error(`Envoie des identifiants de validation de connexion (Bot ID : ${botId}) : ${data.message}`);
                                    reject();
                                }
                            }).on('error', function(err){
                                console.error(`Envoie des identifiants de validation de connexion (Bot ID : ${botId})`, err);
                                reject();
                            });
                        });
                    })
    }




}