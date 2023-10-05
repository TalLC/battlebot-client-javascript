export class TurnRequest{
    /**
     * Rotation à gauche
     *
     * @static
     * @memberof TurnRequest
     */
    static LEFT = "left";

     /**
     * Rotation à droite
     *
     * @static
     * @memberof TurnRequest
     */
    static RIGHT = "right";

     /**
     * Arret de la rotation
     *
     * @static
     * @memberof TurnRequest
     */
     static STOP = "stop";

    /**
     * Direction
     * @type {string}
     * @memberof TurnRequest
     */
    direction;

    /**
     * 
     * @param {string} direction direction (left/right)
     */
    constructor(direction){
        this.direction = direction;
    }
}