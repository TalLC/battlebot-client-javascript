import { Configuration } from "./config/configuration.js";
import { CommunicationManager } from "./communication/communication-manager.js";
import { Registration } from "./communication/registration.js";
import { GameManager } from "./communication/game-manager.js";
import { Bot } from "./bot.js";

global.logLevel = "info";

const TEAMID = "team-id-1";
const BOTNAME = "Warlock";

const config = new Configuration();
const communicationMgr = new CommunicationManager(config);
const registration = new Registration(communicationMgr);
const gameMgr = new GameManager(communicationMgr);

const bot = new Bot();

//déclaration de notre bot
registration.registerBot(TEAMID, BOTNAME)
    .then( (bot_id)=> {
        bot.id = bot_id;
        //vérification de l'ensemble des connexions
        return registration.checkConnexions(bot.id);
    }).then(() => {
        //récupération des données technique du bot (vitalité, vitesse, ...)
        return gameMgr.loadBotConfiguration(bot.id);
    }).then((botConfig) => {
        bot.config = botConfig;
        bot.init(communicationMgr);
        //attente du démarrage du jeux
        return gameMgr.waitGameStarting(bot.id);
    }).then(() => {
        bot.startWatchers( (type,value) => {
            console.log("**** STATUS *****");
            console.log(type + " : " + value);
       }, (scanItems) => {
            console.log("**** DETECTION *****");
            scanItems.forEach(items => {
                 console.log(items)
            });
       }, () => { 
            //fin de partie
       });
       
       //Exemple d'action
    //    bot.action.turnLeft()
    //    bot.action.turnStop();
    //    bot.action.turnRight();
    //    bot.action.moveForward()
    //    bot.action.moveStop();
    //    bot.action.fire(0);
    });

