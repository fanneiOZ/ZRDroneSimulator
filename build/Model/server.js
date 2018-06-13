"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const http_1 = require("http");
const ws_1 = require("ws");
const drone_1 = require("./drone");
const mapping_1 = require("../Config/mapping");
const response_1 = require("./response");
class DroneWebSocketServer {
    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    createApp() {
        this.app = express();
    }
    config() {
        this.port = process.env.PORT || DroneWebSocketServer.PORT;
        this.app.use('/', express.static(path.join(__dirname, '..')));
        this.app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
        this.DroneBuffer = new Array();
        this.connectedClient = new Map();
    }
    createServer() {
        this.server = http_1.createServer(this.app);
    }
    sockets() {
        this.wsServer = new ws_1.Server({ server: this.server });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Listening on %s', this.port);
        });
        this.wsServer.on('connection', ws => {
            let clientID = this.getUniqueID();
            ws.send(clientID);
            console.log((new Date()) + ' Connected from ' + clientID);
            this.connectedClient.set(ws, clientID);
            let iDrone = this.startNewDrone(clientID);
            let res = new response_1.Response(-1 /* Started */, "Drone created.", clientID, iDrone);
            ws.send(JSON.stringify(res));
            ws.on('message', message => this.parseCommand(message, ws, clientID));
            ws.on('close', (code, message) => {
                ws.terminate();
                console.log("Connection from %s closed." /* ConnectionClosed */, clientID);
            });
        });
    }
    startNewDrone(pClientID) {
        let objDrone = new drone_1.Drone(3, 3, mapping_1.keyDirection[mapping_1.mapDirection.NORTH], pClientID);
        this.DroneBuffer.push(objDrone);
        return objDrone;
    }
    ;
    getApp() {
        return this.app;
    }
    getUniqueID() {
        return this.randS4() + this.randS4() + '-' + this.randS4();
    }
    randS4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    parseCommand(message, ws, pClientID) {
        var affectedDrone;
        var Request;
        var requestClientID;
        var res;
        try {
            Request = JSON.parse(message);
            let cmdValue = String(Request.Command).toUpperCase();
            requestClientID = Request.ClientID ? String(Request.ClientID) : pClientID;
            affectedDrone = this.DroneBuffer.find(x => x.getOwner() == requestClientID);
            var reqResult;
            var resMessage;
            var execution;
            switch (cmdValue) {
                case "LEFT" /* rotateToLeft */:
                case "RIGHT" /* rotateToRight */:
                    affectedDrone.Rotate(cmdValue);
                    reqResult = 1 /* Succeeded */;
                    resMessage = "Drone rotated to %rotation% toward the %direction%." /* Rotated */
                        .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace("%rotation%" /* rotation */, cmdValue.toLowerCase());
                    break;
                case "MOVE" /* moveForward */:
                    execution = affectedDrone.Move();
                    reqResult = execution ? 1 /* Succeeded */ : 0 /* Failed */;
                    resMessage = (execution ? "Drone moved to %direction%." /* MoveSucceeded */ : "Drone is at the %direction% edge. Unable to move forward." /* MoveFailed */)
                        .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase());
                    break;
                case "PLACE" /* placeAt */:
                    if (Request.cmdArg && Request.cmdArg.x && Request.cmdArg.y && Request.cmdArg.direction) {
                        let objArg = Request.cmdArg;
                        execution = affectedDrone.Place(Number(objArg.x), Number(objArg.y), String(objArg.direction).toUpperCase());
                        reqResult = execution ? 1 /* Succeeded */ : 0 /* Failed */;
                        resMessage = execution
                            ? "Drone placed at %position% heading to %direction%." /* PlaceSucceeded */
                                .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                                .replace("%position%" /* position */, affectedDrone.getPositionLabel().toLowerCase())
                            : "Unable to place the drone. It must be placed on the table." /* PlaceFailed */;
                    }
                    else {
                        reqResult = 0 /* Failed */;
                        resMessage = "Required command argument not found." /* ArgumentsIncomplete */;
                    }
                    break;
                case "REPEAT" /* repeatCommand */:
                    if (Request.cmdArg && Request.cmdArg.repeatAt) {
                        execution = affectedDrone.Repeat(Number(Request.cmdArg.repeatAt));
                    }
                    else {
                        execution = affectedDrone.Repeat();
                    }
                    reqResult = execution[0] ? 1 /* Succeeded */ : 0 /* Failed */;
                    switch (execution[1]) {
                        case "MOVE" /* moveForward */:
                            resMessage = (execution[0] ? "Drone moved to %direction%." /* MoveSucceeded */ : "Drone is at the %direction% edge. Unable to move forward." /* MoveFailed */)
                                .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase());
                            break;
                        case "LEFT" /* rotateToLeft */:
                        case "RIGHT" /* rotateToRight */:
                            resMessage = "Drone rotated to %rotation% toward the %direction%." /* Rotated */
                                .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                                .replace("%rotation%" /* rotation */, execution[1].toLowerCase());
                            break;
                        case "PLACE" /* placeAt */:
                            resMessage = execution[1]
                                ? "Drone placed at %position% heading to %direction%." /* PlaceSucceeded */
                                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                                    .replace("%position%" /* position */, affectedDrone.getPositionLabel().toLowerCase())
                                : "Unable to place the drone. It must be placed on the table." /* PlaceFailed */;
                            break;
                    }
                    break;
                default:
                    reqResult = 0 /* Failed */;
                    resMessage = "Invalid command. Please try with LEFT, RIGHT, MOVE, PLACE" /* InvalidCommand */;
            }
            let remotePrefix = Request.ClientID ? '[REMOTING] ' : '';
            if (reqResult == 0 /* Failed */) {
                res = new response_1.Response(reqResult, remotePrefix + resMessage, pClientID);
            }
            else {
                res = new response_1.Response(reqResult, remotePrefix + resMessage, pClientID, affectedDrone);
                if (Request.ClientID && reqResult == 1 /* Succeeded */) {
                    let resRemote = this.remoteResponseFactory(pClientID, affectedDrone, cmdValue);
                    let isBroadcasted = this.broadcastRemoteControl(Request.ClientID, resRemote);
                    if (!isBroadcasted) {
                        let failedDisconnected = new response_1.Response(0 /* Failed */, "Remoted drone session disconnected." /* RemoteDisconnected */, pClientID);
                        res = failedDisconnected;
                    }
                }
            }
        }
        catch (_a) {
            reqResult = 0 /* Failed */;
            resMessage = "Command parsing error. Please check request object." /* ProcessingError */;
            res = new response_1.Response(reqResult, resMessage, pClientID);
        }
        finally {
            ws.send(JSON.stringify(res));
        }
    }
    remoteResponseFactory(pClientID, affectedDrone, cmdValue) {
        var resRemoteMessage;
        switch (cmdValue) {
            case "MOVE" /* moveForward */:
                resRemoteMessage = "[REMOTED] Drone remoted moving to %direction% by %remoter%" /* MoveRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case "LEFT" /* rotateToLeft */:
            case "RIGHT" /* rotateToRight */:
                resRemoteMessage = "[REMOTED] Drone remoted rotating to %rotation% toward the %direction% by %remoter%" /* RotateRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%rotation%" /* rotation */, cmdValue.toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case "PLACE" /* placeAt */:
                resRemoteMessage = "[REMOTED] Drone remoted placing at %position% heading to %direction% by %remoter%." /* PlaceRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%position%" /* position */, affectedDrone.getPositionLabel().toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case "REPEAT" /* repeatCommand */:
                break;
        }
        return new response_1.Response(2 /* Remoted */, resRemoteMessage, pClientID, affectedDrone);
    }
    broadcastRemoteControl(remoteClientID, res) {
        var IsAlive = false;
        this.connectedClient.forEach((clientID, ws) => {
            if (remoteClientID == clientID) {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify(res));
                    IsAlive = true;
                }
                else {
                    this.connectedClient.delete(ws);
                }
            }
        });
        return IsAlive;
    }
}
DroneWebSocketServer.PORT = 8085;
exports.DroneWebSocketServer = DroneWebSocketServer;
