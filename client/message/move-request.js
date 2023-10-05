export class MoveRequest{

     /**
     * Rotation à gauche
     *
     * @static
     * @memberof TurnRequest
     */
     static START = "start";

     /**
     * Rotation à droite
     *
     * @static
     * @memberof TurnRequest
     */
     static STOP = "stop";

    /**
     * Demarrage ou arret de l'avancé du bot
     * @type {string}
     * @memberof MoveRequest
     */
    action;

    /**
     * 
     * @param {string} action Demarrage ou arret de l'avancé du bot
     */
    constructor(action){
        this.action = action;
    }
}