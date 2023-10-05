import * as HttpClient from "node-rest-client";
import { Configuration } from "../config/configuration.js";
import { EnrollRequest } from "../client/message/command/enroll-request.js";
import { Client as StompClient } from "@stomp/stompjs";
import * as Mqtt from "mqtt";
import { WebSocket } from 'ws';
import { CheckConnectionRequest } from "../client/message/command/check-connection-request.js";

Object.assign(global, { WebSocket });

/**
 * Configuration par défaut des requette
 */
const DEFAULT_REST_CONFIG = {
    requestConfig: {
		timeout: 5000, //request timeout in milliseconds
		noDelay: true, //Enable/disable the Nagle algorithm
	},
    responseConfig: {
		timeout: 3000 //response timeout
	}
};

const STOMP_ROOT_DESTINATION = "BATTLEBOT.BOT.";
const MQTT_ROOT_DESTINATION = "BATTLEBOT/BOT/";

export class CommunicationManager{
    /**
     * Configuration de l'ensemble des connections
     * @type {Configuration}
     * @memberof CommunicationManager
     */
    configuration;

     /**
     * Client REST
     * @type {Client}
     * @memberof RestCommunication
     */
     restClient;

    /**
     * 
     * @param {Configuration} configuration conifguration de l'ensemble des connections 
     */
    constructor(configuration){
        this.configuration = configuration;
        this.restClient = new HttpClient.Client();
    }

    /**
     * Envoie d'une requette POST
     * @param {string} url URL relative au serveur HTTP 
     * @param {EnrollRequest} body message à envoyé
     * @param {function} cb call back method. eg. (data,response)=> {...}
     * @returns {*} request Http
     */
    httpPost(url,body, cb){
        let args = { ...{data : JSON.stringify(body)}, ...DEFAULT_REST_CONFIG};
        return this.restClient.post(`http://${this.configuration.restServer}:${this.configuration.restPort}${url}` , args, cb);
    }

    /**
     * Envoie d'une requette GET
     * @param {string} url URL relative au serveur HTTP 
     * @param {function} cb call back method. eg. (data,response)=> {...}
     * @returns {*} request Http
     */
    httpGet(url,cb){
        return this.restClient.get(`http://${this.configuration.restServer}:${this.configuration.restPort}${url}` , DEFAULT_REST_CONFIG, cb);
    }

    /**
     * Envoie d'une requette PATCH
     * @param {string} url URL relative au serveur HTTP 
     * @param {CheckConnectionRequest} body message à envoyé 
     * @param {function} cb call back method. eg. (data,response)=> {...}
     * @returns {*} request Http
     */
    httpPatch(url,body, cb){
        let args = { ...{data : JSON.stringify(body)}, ...DEFAULT_REST_CONFIG};
        return this.restClient.patch(`http://${this.configuration.restServer}:${this.configuration.restPort}${url}` , args, cb);
    }

    /**
     * récupération d'une connexion STOMP
     * @returns {StompClient} client stomp
     */
    stompConnexion(){
        return  new StompClient({
            brokerURL: `ws://${this.configuration.stompServer}:${this.configuration.stompPort}`,
            connectHeaders: {
                login: this.configuration.stompUserName,
                passcode: this.configuration.stompPassword,
              },
              debug: function (str) {
                console.trace(str);
              },
        })
    }

     /**
     * Deconnexion au serveur STOMP
     * @param {StompClient} stompClient client stomp
     * @returns {Promise<void>} deconnexion
     */
     closeStompConnexion(stompClient){
        console.trace("Call stomp deconnexion");
        return stompClient.deactivate();
    }

    /**
     * @param {string} botId
     * @param {numer} timeout ms timeout to receceive message
     * @returns {Promise<string>}  
     */
    stompConnectAndReadOneMessage(botId,timeout = 5000){
        const stompClient = this.stompConnexion();
        return new Promise((resolve,reject)=> {
            const timeOutId = setTimeout(()=> {
                console.error("Stomp message reception timeout while reading single message");
                this.closeStompConnexion(stompClient).then(()=> {reject("Timeout");});
            }, timeout);
            stompClient.onConnect = () => {
                console.trace("Stomp server connected");
                /**{@type {StompSubscription}} */
                const subscription = stompClient.subscribe(`${STOMP_ROOT_DESTINATION}${botId}`, message => {
                    subscription.unsubscribe()
                    clearTimeout(timeOutId);
                    console.trace("Stomp message received " + message.body);
                    this.closeStompConnexion(stompClient).then( () => resolve(JSON.parse(message.body)));
                });
            };
            stompClient.activate();
        });
    }

    /**
     * @param {string} botId
     * @param {number} nbMsg nombre de message à lire
     * @param {numer} timeout ms timeout to receceive message
     * @returns {Promise<Array<string>>}  
     */
    stompConnectAndReadNMessages(botId,nbMsg, timeout = 5000){
        let count = 0;
        let res = [];
        const stompClient = this.stompConnexion();
        return new Promise((resolve,reject)=> {
            const timeOutId = setTimeout(()=> {
                console.error(`Stomp message reception timeout while reading ${nbMsg} messages`);
                this.closeStompConnexion(stompClient).then(()=> {reject("Timeout");});
            }, timeout);
            stompClient.onConnect = () => {
                console.trace("Stomp server connected");
                /**{@type {StompSubscription}} */
                const subscription = stompClient.subscribe(`${STOMP_ROOT_DESTINATION}${botId}`, message => {
                    console.trace("Stomp message received " + message.body);
                    res.push(JSON.parse(message.body))
                    count++;
                    if(count === nbMsg){
                        clearTimeout(timeOutId);
                        subscription.unsubscribe()
                        this.closeStompConnexion(stompClient).then( () => resolve(res));
                    }
                });
            };
            stompClient.activate();
        });
    }

    /**
     * @param {string} botId
     * @param {Function} cb callback fuction
     * @returns {StompClient} connection stomp
     */
    stompConnectAndListen(botId,cb){
        const stompClient = this.stompConnexion();
        stompClient.onConnect = () => {
            console.trace("Stomp server connected");
            stompClient.subscribe(`${STOMP_ROOT_DESTINATION}${botId}`, message => {
                console.debug("Stomp message received " + message.body);
                cb(JSON.parse(message.body));
            });
        };
        stompClient.activate();   
    }

    /**
     * récupération d'une connexion MQTT
     * @returns {Mqtt.Client} client MQTT
     */
    mqttConnexion(){
        return  Mqtt.connect(`mqtt://${this.configuration.mqttServer}:${this.configuration.mqttPort}`,
         {
            username : this.configuration.mqttUsername,
            password : this.configuration.mqttPassword
         }
        );

    }

     /**
     * Deconnexion au serveur MQTT
     * @param {Mqtt.MqttClient} mqttClient client mqtt
     * @returns {Promise<void>} deconnexion
     */
     closeMqttConnexion(mqttClient){
        console.trace("Call MQTT deconnexion");
        return mqttClient.endAsync();
    }

    /**
     * @param {string} botId
     * @param {numer} timeout ms timeout to receceive message
     * @returns {Promise<string>}  
     */
     mqttConnectAndReadOneMessage(botId,timeout = 5000){
        const mqttClient = this.mqttConnexion();
        return new Promise((resolve,reject)=> {
            const timeOutId = setTimeout(()=> {
                console.trace("MQTT message reception timeout");
                reject("Timeout");
                this.closeMqttConnexion(mqttClient);
            }, timeout);
            
            mqttClient.on("connect", () => {
                console.trace("MQTT server connected");
                mqttClient.subscribe(`${MQTT_ROOT_DESTINATION}${botId}`, err => {
                    if(err){
                        clearTimeout(timeOutId);
                        console.error(`souscription au topic ${MQTT_ROOT_DESTINATION}${botId} : ${err}`);
                        reject(err);
                        this.closeMqttConnexion(mqttClient);
                    }
                });
            });

            mqttClient.on("message", (topic,message) => {
                clearTimeout(timeOutId);
                console.debug("MQTT message received " + message);
                resolve(JSON.parse(message));
                this.closeMqttConnexion(mqttClient);
            });
        });
    }

   /**
     * @param {string} botId
     * @param {Function} cb callback function
     * @returns {Mqtt.MqttClient} connectin Mqtt
     */
    mqttConnectAndListen(botId,cb){
        const mqttClient = this.mqttConnexion();
        //connection au serveur MQTT et souscription aux messages
        mqttClient.on("connect", () => {
            console.log("MQTT listener ready");
            mqttClient.subscribe(`${MQTT_ROOT_DESTINATION}${botId}`, err => {
                if(err){
                    console.error(`souscription au topic ${MQTT_ROOT_DESTINATION}${botId} : ${err}`);
                    this.closeMqttConnexion(mqttClient);
                }
            });
        });

        //lecture des messages
        mqttClient.on("message", (topic, message) => {
            cb(JSON.parse(message));
        });
        return mqttClient;
    };
}