export class CheckConnectionRequest{
    /**
     * Indentifiant de connexion REST
     * @type {string}
     * @memberof CheckConnectionRequest
     */
    rest_id;

    /**
     * Indentifiant de connexion MQTT
     * @type {string}
     * @memberof CheckConnectionRequest
     */
    mqtt_id;

    /**
     * Indentifiant de connexion STOMP
     * @type {string}
     * @memberof CheckConnectionRequest
     */
    stomp_id;

    /**
     * 
     * @param {string} restId Identifiant REST
     * @param {string} stompId Identifiant STOMP
     * @param {string} mqttId Identidiant MQTT
     */
    constructor(restId, stompId, mqttId){
        this.rest_id = restId;
        this.stomp_id = stompId;
        this.mqtt_id = mqttId;
    }
}