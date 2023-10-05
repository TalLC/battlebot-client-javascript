import { FireRequest } from "../client/message/fire-request.js";
import { MoveRequest } from "../client/message/move-request.js";
import { TurnRequest } from "../client/message/turn-request.js";
import { CommunicationManager } from "./communication-manager.js";

/**
 * Gestion des actions du bot
 */
export class BotActions{
    /**
     * Gestion technique des appels aux serveurs
     * @type {CommunicationManager}
     * @memberof BotActions
     */
    manager;

    /**
     * Gestion technique des appels aux serveurs
     * @type {string}
     * @memberof BotActions
     */
    botId;

    /**
     * 
     * @param {CommunicationManager} manager Gestion thecnique des appels aux serveurs
     * @param {string} botId identifiant du bot
     */
    constructor(manager,botId){
        this.manager = manager;
        this.botId = botId;
    }

    /**
     * Rotation à gauche
     * @returns 
     */
    turnLeft(){
        return this.turn(TurnRequest.LEFT);
    }

    /**
     * Rotation à droite
     * @returns  {Promise<void>}
     */
    turnRight(){
        return this.turn(TurnRequest.RIGHT);
    }

    /**
     * Arret rotation
     * @returns  {Promise<void>}
     */
    turnStop(){
        return this.turn(TurnRequest.STOP);
    }

    /**
     * Rotation
     * @param {string} direction right/left/stop
     * @returns {Promise<void>}
     */
    turn(direction){
        return new Promise( (resolve,reject) => {
            let request = new TurnRequest(direction);
            this.manager.httpPatch("/bots/" + this.botId + "/action/turn",request,  (data, response) => {
                if(data.status === 'ok'){
                    resolve();
                }else{
                    console.error(`Rotation  ${direction} : ${data.message}`);
                    reject();
                }
            }).on('error', function(err){
                console.error(`Rotation ${direction}`, err);
                reject();
            });
        });
    }

    /**
     * On avance
     * @returns {Promise<void>}
     */
    moveForward(){
        return this.move(MoveRequest.START);
    }

    /**
     * On arrete d'avancer 
     * @returns {Promise<void>}
     */
    moveStop(){
        return this.move(MoveRequest.STOP);
    }

     /**
     * Déplacement
     * @param {string} action start/stop
     * @returns {Promise<void>}
     */
     move(action){
        return new Promise( (resolve,reject) => {
            let request = new MoveRequest(action);
            this.manager.httpPatch("/bots/" + this.botId + "/action/move",request,  (data, response) => {
                if(data.status === 'ok'){
                    resolve();
                }else{
                    console.error(`Déplacement  ${action} : ${data.message}`);
                    reject();
                }
            }).on('error', function(err){
                console.error(`Déplacement ${action}`, err);
                reject();
            });
        });
    }

    /**
     * Tir du bot
     * @param {number} angle angle de tir (degres)
     * @returns {Promise<void>}
     */
    fire(angle){
        return new Promise( (resolve,reject) => {
            let request = new FireRequest(angle);
            this.manager.httpPatch("/bots/" + this.botId + "/action/shoot",request,  (data, response) => {
                if(data.status === 'ok'){
                    resolve();
                }else{
                    let message = data.internal_code ? data.internal_code + " : " + data.label
                                                    : data.message ? data.message : JSON.stringify(data);
                    console.error(`Tir angle ${angle}, message: ${message}`);
                    reject(message);
                }
            }).on('error', function(err){
                console.error(`Tir angle ${angle}`, err);
                reject(err);
            });
        });
    }
}