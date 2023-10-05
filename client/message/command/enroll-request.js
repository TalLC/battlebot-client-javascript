export class EnrollRequest{
    /**
     * Identifiant de l'équipe
     * @type {string}
     * @memberof EnrollRequest
     */
    team_id;

    /**
     * Nom du bot
     * @type {string}
     * @memberof EnrollRequest
     */
    bot_name;

    /**
     * 
     * @param {string} teamId Identifiant de l'équipe
     * @param {string} botName Nom du bot
     */
    constructor(teamId, botName){
        this.team_id = teamId;
        this.bot_name = botName;
    }
}