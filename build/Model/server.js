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
            res.setCommandInput(mapping_1.droneCommand.createDrone);
            res.setCommandAction(mapping_1.droneCommand.placeAt);
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
        var connectedClient;
        var commandInput;
        var commandAction;
        try {
            Request = JSON.parse(message);
            let cmdValue = String(Request.Command).toUpperCase();
            commandInput = cmdValue;
            commandAction = commandInput;
            requestClientID = Request.ClientID ? String(Request.ClientID) : pClientID;
            affectedDrone = this.DroneBuffer.find(x => x.getOwner() == requestClientID);
            var reqResult;
            var resMessage;
            var execution;
            switch (cmdValue) {
                case mapping_1.droneCommand.rotateToLeft:
                case mapping_1.droneCommand.rotateToRight:
                    affectedDrone.Rotate(cmdValue);
                    reqResult = 1 /* Succeeded */;
                    resMessage = "Drone rotated to %rotation% toward the %direction%." /* Rotated */
                        .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace("%rotation%" /* rotation */, cmdValue.toLowerCase());
                    break;
                case mapping_1.droneCommand.moveForward:
                    execution = affectedDrone.Move();
                    reqResult = execution ? 1 /* Succeeded */ : 0 /* Failed */;
                    resMessage = (execution ? "Drone moved to %direction%." /* MoveSucceeded */ : "Drone is at the %direction% edge. Unable to move forward." /* MoveFailed */)
                        .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase());
                    break;
                case mapping_1.droneCommand.placeAt:
                    if (Request.cmdArg
                        && Request.cmdArg.x && !isNaN(Request.cmdArg.x)
                        && Request.cmdArg.y && !isNaN(Request.cmdArg.y)
                        && Request.cmdArg.direction) {
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
                case mapping_1.droneCommand.repeatCommand:
                    if (Request.cmdArg && Request.cmdArg.repeatAt) {
                        execution = affectedDrone.Repeat(Number(Request.cmdArg.repeatAt));
                    }
                    else {
                        execution = affectedDrone.Repeat();
                    }
                    let itemRepeat = affectedDrone.getCommandAction(Number(Request.cmdArg.repeatAt));
                    commandAction = itemRepeat.commandAction;
                    reqResult = execution[0] ? 1 /* Succeeded */ : 0 /* Failed */;
                    switch (execution[1]) {
                        case mapping_1.droneCommand.moveForward:
                            resMessage = (execution[0] ? "Drone moved to %direction%." /* MoveSucceeded */ : "Drone is at the %direction% edge. Unable to move forward." /* MoveFailed */)
                                .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase());
                            break;
                        case mapping_1.droneCommand.rotateToLeft:
                        case mapping_1.droneCommand.rotateToRight:
                            resMessage = "Drone rotated to %rotation% toward the %direction%." /* Rotated */
                                .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                                .replace("%rotation%" /* rotation */, execution[1].toLowerCase());
                            break;
                        case mapping_1.droneCommand.placeAt:
                            resMessage = execution[1]
                                ? "Drone placed at %position% heading to %direction%." /* PlaceSucceeded */
                                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                                    .replace("%position%" /* position */, affectedDrone.getPositionLabel().toLowerCase())
                                : "Unable to place the drone. It must be placed on the table." /* PlaceFailed */;
                            break;
                    }
                    break;
                case mapping_1.droneCommand.requestRemote:
                    connectedClient = this.requestConnectedClient(pClientID);
                    reqResult = -2 /* ListPushed */;
                    resMessage = "List of connected clients pushed." /* ConnectedClientsPushed */;
                    break;
                case mapping_1.droneCommand.cancelRemote:
                    if (Request.ClientID) {
                        reqResult = -3 /* RemoteDisconnected */;
                        resMessage = "Remoted drone session disconnected." /* RemoteDisconnected */;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = -99 /* ToBeIgnored */;
                        res = new response_1.Response(reqResult, resMessage, requestClientID);
                    }
                    else {
                        reqResult = 0 /* Failed */;
                        resMessage = "Required command argument not found." /* ArgumentsIncomplete */;
                    }
                    break;
                case mapping_1.droneCommand.enterRemote:
                    if (Request.ClientID) {
                        reqResult = -4 /* RemoteRequested */;
                        resMessage = "Being Remoted by %remoter%" /* BeingRemoted */;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = -99 /* ToBeIgnored */;
                        res = new response_1.Response(reqResult, resMessage, requestClientID);
                    }
                    else {
                        reqResult = 0 /* Failed */;
                        resMessage = "Required command argument not found." /* ArgumentsIncomplete */;
                    }
                    break;
                case mapping_1.droneCommand.exitRemote:
                    if (Request.ClientID) {
                        reqResult = -5 /* RemoteClosed */;
                        resMessage = "Remoted drone session disconnected." /* RemoteDisconnected */;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = -99 /* ToBeIgnored */;
                        res = new response_1.Response(reqResult, resMessage, requestClientID);
                    }
                    else {
                        reqResult = 0 /* Failed */;
                        resMessage = "Required command argument not found." /* ArgumentsIncomplete */;
                    }
                    break;
                default:
                    reqResult = 0 /* Failed */;
                    resMessage = "Invalid command. Please try with LEFT, RIGHT, MOVE, PLACE" /* InvalidCommand */;
            }
            let remotePrefix = Request.ClientID ? '[REMOTING] ' : '';
            if (reqResult == -2 /* ListPushed */) {
                res = new response_1.Response(reqResult, resMessage, pClientID, null, connectedClient);
            }
            else if (reqResult == 0 /* Failed */) {
                res = new response_1.Response(reqResult, remotePrefix + resMessage, pClientID);
            }
            else if (reqResult != -99 /* ToBeIgnored */) {
                res = new response_1.Response(reqResult, remotePrefix + resMessage, pClientID, affectedDrone);
                if (Request.ClientID && reqResult == 1 /* Succeeded */) {
                    let resRemote = this.remoteResponseFactory(pClientID, affectedDrone, cmdValue);
                    resRemote.setCommandInput(commandInput);
                    resRemote.setCommandAction(commandAction);
                    let isBroadcasted = this.broadcastRemoteControl(Request.ClientID, resRemote);
                    if (!isBroadcasted) {
                        let failedDisconnected = new response_1.Response(-3 /* RemoteDisconnected */, "Remoted drone session disconnected." /* RemoteDisconnected */, pClientID);
                        res = failedDisconnected;
                    }
                }
            }
            if (reqResult != -99 /* ToBeIgnored */) {
                res.setCommandAction(commandAction);
                res.setCommandInput(commandInput);
            }
        }
        catch (e) {
            console.log(e);
            reqResult = 0 /* Failed */;
            resMessage = "Command parsing error. Please check request object." /* ProcessingError */;
            res = new response_1.Response(reqResult, resMessage, pClientID);
        }
        finally {
            ws.send(JSON.stringify(res));
        }
    }
    pingpongSession(requestClientID, remotingClientID, reqResult, resMessage) {
        let res = new response_1.Response(reqResult, resMessage, requestClientID);
        this.broadcastRemoteControl(remotingClientID, res);
        return res;
    }
    remoteResponseFactory(pClientID, affectedDrone, cmdValue) {
        var resRemoteMessage;
        switch (cmdValue) {
            case mapping_1.droneCommand.moveForward:
                resRemoteMessage = "Drone remoted moving to %direction% by %remoter%" /* MoveRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case mapping_1.droneCommand.rotateToLeft:
            case mapping_1.droneCommand.rotateToRight:
                resRemoteMessage = "Drone remoted rotating to %rotation% toward the %direction% by %remoter%" /* RotateRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%rotation%" /* rotation */, cmdValue.toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case mapping_1.droneCommand.placeAt:
                resRemoteMessage = "Drone remoted placing at %position% heading to %direction% by %remoter%." /* PlaceRemoted */
                    .replace("%direction%" /* direction */, affectedDrone.getDirectionLabel().toLowerCase())
                    .replace("%position%" /* position */, affectedDrone.getPositionLabel().toLowerCase())
                    .replace("%remoter%" /* remoter */, pClientID);
                break;
            case mapping_1.droneCommand.repeatCommand:
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
    requestConnectedClient(requestClientID) {
        let connectedClient = new Array();
        this.connectedClient.forEach((clientID, ws) => {
            if (requestClientID != clientID) {
                if (ws.readyState === 1) {
                    connectedClient.push(clientID);
                }
                else {
                    this.connectedClient.delete(ws);
                }
            }
        });
        return connectedClient;
    }
}
DroneWebSocketServer.PORT = 8085;
exports.DroneWebSocketServer = DroneWebSocketServer;
