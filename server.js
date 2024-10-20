const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 4444; // Sostituisci con la porta desiderata per il tuo server

// Middleware per gestire i dati JSON
app.use(express.json());

app.currentUsers = 0;
app.requireWaldorf = 0; //1 se un giocatore fa il lock in, 2 waldorf riceve il valore. deve aspettare il 12 per l'ok. (13 per no, ecc...)
app.notifyForSomeone = false; //true per un giro se si connette qualcuno
app.notifyAlmostReady = false;
app.userNames = [1,1,1,1,1]; //0=chosen name, 1=pc name, 2=reacode, 3=invaligate name, 4=natalone game

//nota: valore 0 è quello attuale, 1 è l'ultimo inviato
app.PlayerCoordX = 0;
app.PlayerCoordY = 0;
app.PlayerMapId = 1;
app.PlayerDir = 2;

app.EvilCoordX = [0,-1];
app.EvilCoordY = [0,-1];
app.PerceivedMonsterX = 0;
app.PerceivedMonsterY = 0;
app.EvilMapId = [0,-1];
app.EvilDir = [2,0];
app.evilSpeed = [4,3]; //diverso così fa update
app.evilDirectionFix = [false,0];
app.evilInvisible = [false,0];
app.evilGhostMode = [false,0];
app.evilHitbox = [false, 0];
app.droppedItem = 0;

app.PlayerChoice = [0,-1];
app.EvilDecision = [0,-1];
app.ChaseMode = [false,0]
app.feedbackMode = [false,0]
app.evilQuestion = [0,0]
app.questionAnsw = 0;
app.streamDonation = 0;
app.forceSwitchOn = 0; //from host to player

app.PlayerMidEvent = false;
app.PlayerGotCaught = [false,0];
app.lightSwitchPlayer = 0 //the data FROM the player
app.lightSwitchMonster = 0
app.itemTakenPlayer = 0;
app.itemTakenMonster = 0;
app.playerLife = [0,0]
app.playerInventory = [0,0]
app.playerItemSwitch = 0;
app.playerPasswordInput = [0,0]
app.playerMenuState = [0,0];
app.playerAltars = 0

app.webcamOn = [false,0];
app.forceUpdate = false;
app.musicPlaying = 0

app.userPing = 999;
app.userLogTime = [0,0]

app.userId = 2; //da aggiornare ogni utente, per sicurezza. per evitare che un utente connesso prima e non uscito propriamente interferisca.

// Endpoint per gestire le richieste POST dal client
app.post('/', (req, res) => { //nota: togli Data per MZ
    data = req.body;
    if (data.hasOwnProperty('host')/*req.body.type == "host"*/){
        if(Object.keys(data).length > 1){
            delete req.body.host;
            console.log('Dati ricevuti dal host:', req.body);
        }
        //update dei dati ricevuti del HOST, che fa il malvagio (io)
        if(data.hasOwnProperty('coordX')){app.EvilCoordX[0] = data.coordX}
        if(data.hasOwnProperty('coordY')){app.EvilCoordY[0] = data.coordY}
        if(data.hasOwnProperty('mapId')){app.EvilMapId[0] = data.mapId}
        if(data.hasOwnProperty('dir')){app.EvilDir[0] = data.dir}
        if(data.hasOwnProperty('camOn')){app.webcamOn[0] = data.camOn}
        if(data.hasOwnProperty('choice')){app.EvilDecision[0] = data.choice}
        if(data.hasOwnProperty('dirFix')){app.evilDirectionFix[0] = data.dirFix}
        if(data.hasOwnProperty('invis')){app.evilInvisible[0] = data.invis}
        if(data.hasOwnProperty('ghost')){app.evilGhostMode[0] = data.ghost}
        if(data.hasOwnProperty('chase')){app.ChaseMode[0] = data.chase}
        if(data.hasOwnProperty('feedback')){app.feedbackMode[0] = data.feedback}
        if(data.hasOwnProperty('speed')){app.evilSpeed[0] = data.speed}
        if(data.hasOwnProperty('question')){app.evilQuestion[0] = data.question}
        if(data.hasOwnProperty('hitbox')){app.evilHitbox[0] = data.hitbox}
        if(data.hasOwnProperty('drop')){app.droppedItem = data.drop}
        if(data.hasOwnProperty('donation')){app.streamDonation = data.donation}
        if(data.hasOwnProperty('forceUpdate')){app.forceUpdate = true}
        if(data.hasOwnProperty('lightswitch')){app.lightSwitchMonster = data.lightswitch}
        if(data.hasOwnProperty('music')){app.musicPlaying = data.music}
        if(data.hasOwnProperty('forceSwitch')){app.forceSwitchOn = data.forceSwitch}
        if(data.hasOwnProperty('takeItem')){app.itemTakenMonster = data.takeItem}

        if(data.hasOwnProperty('waldorfState')){app.requireWaldorf = data.waldorfState}

        //mi invio i dati del player
        var answerToHost = {host: true, coordX: app.PlayerCoordX, coordY: app.PlayerCoordY, dir: app.PlayerDir, mapId: app.PlayerMapId, 
            busy: app.PlayerMidEvent, ping: app.userPing, percX: app.PerceivedMonsterX, percY: app.PerceivedMonsterY}
        if(app.PlayerGotCaught[0] != app.PlayerGotCaught[1]){answerToHost.caught = app.PlayerGotCaught[0]; app.PlayerGotCaught[1] = app.PlayerGotCaught[0]}
        if(app.PlayerChoice[0] != app.PlayerChoice[1]){answerToHost.choice = app.PlayerChoice[0]; app.PlayerChoice[1] = app.PlayerChoice[0]}
        if(app.questionAnsw != 0){answerToHost.questionAnsw = app.questionAnsw; app.questionAnsw = 0}
        if(app.lightSwitchPlayer != 0){answerToHost.lightswitch = app.lightSwitchPlayer; app.lightSwitchPlayer = 0}
        if(app.playerLife[0] != app.playerLife[1]){answerToHost.life = app.playerLife[0]; app.playerLife[1] = app.playerLife[0]}
        if(app.playerInventory[0] != app.playerInventory[1]){answerToHost.inventory = app.playerInventory[0]; app.playerInventory[1] = app.playerInventory[0]}
        if(app.playerPasswordInput[0] != app.playerPasswordInput[1]){answerToHost.password = app.playerPasswordInput[0]; app.playerPasswordInput[1] = app.playerPasswordInput[0]}
        if(app.playerMenuState[0] != app.playerMenuState[1]){answerToHost.menu = app.playerMenuState[0]; app.playerMenuState[1] = app.playerMenuState[0]}

        if(app.requireWaldorf == 1){
            answerToHost.requireWaldorf = app.userNames[0]; app.requireWaldorf = 2
            answerToHost.userData = app.userNames;}
        if(app.notifyForSomeone == true){answerToHost.notify = true; app.notifyForSomeone = false} //sends a sound if someone launches the game
        if(app.notifyAlmostReady == true){answerToHost.notify2 = true; app.notifyAlmostReady = false} //sends a sound if someone launches the game
        if(app.playerItemSwitch != 0){answerToHost.itemSwitch = app.playerItemSwitch; app.playerItemSwitch = 0}
        if(app.itemTakenPlayer != 0){answerToHost.takeItem = app.itemTakenPlayer; app.itemTakenPlayer = 0}
        if(app.playerAltars != 0){answerToHost.altar = app.playerAltars; app.playerAltars = 0}
        res.json(answerToHost)
        
    } else{

        var answerToPlayer = {}
        var approved = 1;

        if(data.hasOwnProperty('firstConnect')){
            if(data.firstConnect == 1){
                //first check per verificare se il server è libero, e non ci sia una partita in corso.
                if(app.currentUsers == 0){
                    app.notifyForSomeone = true;
                    answerToPlayer.connState = 1;
                } else{
                    answerToPlayer.connState = -1;
                    if(data.hasOwnProperty('thisUserId')){
                        if(!isNaN(data.thisUserId)){
                            if(data.thisUserId == app.userId){
                                //stesso utente, riconnessione!!!
                                answerToPlayer.connState = 100;
                            }
                        }
                    }
                        
                }
                
            }
            if(data.firstConnect == "almost"){
                //about to insert name and be locked in
                app.notifyAlmostReady = true;
                
            }
            if(data.firstConnect == 2){
                //secondo check per vedere se fare il lock in
                if(app.currentUsers == 0){
                    //LOCK IN
                    answerToPlayer.connState = 2;
                    answerToPlayer.userId = app.userId;
                    app.currentUsers = 1;
                    app.requireWaldorf = 1;
                } else{
                    answerToPlayer.connState = -2;
                }

                logUserDataConnection(data)

                
            }
            if(data.firstConnect == 3){
                //wait for waldorf presence approval
                if(app.requireWaldorf >= 10){
                    //Waldorf risponde
                    answerToPlayer.connState  = app.requireWaldorf;
                }
                
            }            
        }

        if(data.hasOwnProperty('u')){ //check user id
            if(data.u == app.userId){
                approved = 2;
            } else{ //user ID errato
                approved = 0;
                answerToPlayer.code = "SceneManager.exit();"
            }
        }

        if(approved >= 1){ //accesso minimo, posso mandare i dati
        //dati ricevuti dal PLAYER, li salvo
        if(data.hasOwnProperty('x')){app.PlayerCoordX = data.x}
        if(data.hasOwnProperty('y')){app.PlayerCoordY = data.y}
        if(data.hasOwnProperty('mx')){app.PerceivedMonsterX = data.mx}
        if(data.hasOwnProperty('my')){app.PerceivedMonsterY = data.my}
        if(data.hasOwnProperty('map')){app.PlayerMapId = data.map}
        if(data.hasOwnProperty('d')){app.PlayerDir = data.d}
        if(data.hasOwnProperty('busy')){app.PlayerMidEvent = data.busy}
        if(data.hasOwnProperty('ch')){app.PlayerChoice[0] = data.ch}
        if(data.hasOwnProperty('caught')){app.PlayerGotCaught[0] = data.caught}
        if(data.hasOwnProperty('questionAnsw')){app.questionAnsw = data.questionAnsw}
        if(data.hasOwnProperty('lightswitch')){app.lightSwitchPlayer = data.lightswitch}
        if(data.hasOwnProperty('life')){app.playerLife[0] = data.life}
        if(data.hasOwnProperty('inventory')){app.playerInventory[0] = data.inventory}
        if(data.hasOwnProperty('itemSwitch')){app.playerItemSwitch = data.itemSwitch}
        if(data.hasOwnProperty('password')){app.playerPasswordInput[0] = data.password}
        if(data.hasOwnProperty('takeItem')){app.itemTakenPlayer = data.takeItem}
        if(data.hasOwnProperty('menu')){app.playerMenuState[0] = data.menu}
        if(data.hasOwnProperty('altar')){app.playerAltars = data.altar}

        if(data.hasOwnProperty('chosenName')){app.userNames[0] = data.chosenName}
        if(data.hasOwnProperty('pcName')){app.userNames[1] = data.pcName}
        if(data.hasOwnProperty('reaCode')){app.userNames[2] = data.reaCode}
        if(data.hasOwnProperty('invaligateName')){app.userNames[3] = data.invaligateName}
        if(data.hasOwnProperty('natalName')){app.userNames[4] = data.natalName}

        if (data.hasOwnProperty('u')/*req.body.type == "host"*/){
            if(Object.keys(data).length > 1){
                delete req.body.u;
                console.log('Dati ricevuti dal client:', req.body);
            }
        }
        }
        
        if(approved >= 2){ //accesso normale, mando e ricevo i dati: sono in game.
        //invio i dati del malvagio
        if(app.forceUpdate){app.EvilCoordX[1]=0;app.EvilCoordY[1]=0;app.EvilDir[1]=0;app.EvilMapId[1]=0;/*app.evilSpeed[1]=4;*/answerToPlayer.update=1;app.forceUpdate = false}
        if(app.EvilCoordX[0] != app.EvilCoordX[1]){answerToPlayer.x = app.EvilCoordX[0]; app.EvilCoordX[1] = app.EvilCoordX[0]}
        if(app.EvilCoordY[0] != app.EvilCoordY[1]){answerToPlayer.y = app.EvilCoordY[0]; app.EvilCoordY[1] = app.EvilCoordY[0]}
        if(app.EvilDir[0] != app.EvilDir[1]){answerToPlayer.d = app.EvilDir[0]; app.EvilDir[1] = app.EvilDir[0]}
        if(app.EvilMapId[0] != app.EvilMapId[1]){answerToPlayer.map = app.EvilMapId[0]; app.EvilMapId[1] = app.EvilMapId[0]}
        if(app.webcamOn[0] != app.webcamOn[1]){answerToPlayer.cam = app.webcamOn[0]; app.webcamOn[1] = app.webcamOn[0]}
        if(app.EvilDecision[0] != app.EvilDecision[1]){answerToPlayer.ch = app.EvilDecision[0]; app.EvilDecision[1] = app.EvilDecision[0]}
        if(app.evilDirectionFix[0] != app.evilDirectionFix[1]){answerToPlayer.dirF = app.evilDirectionFix[0]; app.evilDirectionFix[1] = app.evilDirectionFix[0]}
        if(app.evilInvisible[0] != app.evilInvisible[1]){answerToPlayer.inv = app.evilInvisible[0]; app.evilInvisible[1] = app.evilInvisible[0]}
        if(app.evilGhostMode[0] != app.evilGhostMode[1]){answerToPlayer.gho = app.evilGhostMode[0]; app.evilGhostMode[1] = app.evilGhostMode[0]}
        if(app.ChaseMode[0] != app.ChaseMode[1]){answerToPlayer.chase = app.ChaseMode[0]; app.ChaseMode[1] = app.ChaseMode[0]}
        if(app.feedbackMode[0] != app.feedbackMode[1]){answerToPlayer.feedback = app.feedbackMode[0]; app.feedbackMode[1] = app.feedbackMode[0]}
        if(app.evilSpeed[0] != app.evilSpeed[1]){answerToPlayer.sp = app.evilSpeed[0]; app.evilSpeed[1] = app.evilSpeed[0]}
        if(app.evilQuestion[0] != app.evilQuestion[1]){answerToPlayer.question = app.evilQuestion[0]; app.evilQuestion[1] = app.evilQuestion[0]}
        if(app.evilHitbox[0] != app.evilHitbox[1]){answerToPlayer.hitbox = app.evilHitbox[0]; app.evilHitbox[1] = app.evilHitbox[0]}
        
        if(app.streamDonation != 0){answerToPlayer.donation = app.streamDonation; app.streamDonation = 0}
        if(app.lightSwitchMonster != 0){answerToPlayer.lightswitch = app.lightSwitchMonster; app.lightSwitchMonster = 0}
        if(app.droppedItem != 0){answerToPlayer.drop = app.droppedItem; app.droppedItem = 0}
        if(app.musicPlaying != 0){answerToPlayer.music = app.musicPlaying; app.musicPlaying = 0}
        if(app.forceSwitchOn != 0){answerToPlayer.forceSwitch = app.forceSwitchOn; app.forceSwitchOn = 0}
        if(app.itemTakenMonster != 0){answerToPlayer.takeItem = app.itemTakenMonster; app.itemTakenMonster = 0}
        
        }

        res.json(answerToPlayer);
        if(Object.keys(answerToPlayer).length > 0){
            console.log('Risposta inviata al client:', answerToPlayer);
        }
        const d = new Date();
        let time = d.getTime()
        app.userLogTime.push(time)
        if(app.userLogTime.length >= 10){app.userLogTime.shift()}
    }
    
});

// Avvio del server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});

function checkUserPing() {
    if(app.currentUsers == 0){
        return;
    }
    const d = new Date();
    let time = d.getTime()
    var sum = 0;
    var length = app.userLogTime.length
    for (let index = 0; index < length-1; index++) {
        sum = app.userLogTime[index+1] - app.userLogTime[index]
        
    }
    if(length > 1){
        sum = sum / (length-1);
    }
    var currentPingWait = time-app.userLogTime[length-1]
    if(sum < currentPingWait){
        sum = currentPingWait;
    }
    if(sum > 99999){sum = 99999}
    app.userPing = sum;
}

setInterval(checkUserPing, 1000);

function logUserDataConnection (data){
    
    username = ""
    pcName = ""
    reaCode = ""
    invaligateName = "";
    natalName = "";


    if(data.hasOwnProperty('chosenName')){username = data.chosenName}
    if(data.hasOwnProperty('pcName')){pcName = data.pcName}
    if(data.hasOwnProperty('reaCode')){reaCode = data.reaCode}
    if(data.hasOwnProperty('invaligateName')){
        if(data.invaligateName != ""){
            invaligateName = ", invaligateName: "+ data.invaligateName;
        }
    }
    if(data.hasOwnProperty('natalName')){
        if(data.natalName != ""){
            natalName = ", natalName: " + data.natalName;
        }
    }        
    
    const fs = require('fs');

    // Gets the timestamp for the .txt log
    const currentDate = new Date().toLocaleString();
    const content = currentDate + "; " + "username: "+username + ", pcName: " + pcName + ", reaCode: "+reaCode + invaligateName + natalName +'\n';

    // Writes the exact intercepted code on a file.
    try{
        fs.writeFile('userLog.txt', content, { flag: 'a+' }, (err) => {
            if (err) {
                console.log('Error writing to file:', err);
            } else {
                console.log('Code logged successfully');
            }
        });
    } catch (error){
        failedToWrite = true;
    }

    try{
        text1 = "connection inbound"
        if (Notification.permission === "granted") {
            new Notification(text1);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(text1);
                }
            });
        }
    } catch (error){

    }

}