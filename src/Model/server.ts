import * as express from 'express';
import * as path from 'path';
import { Server as HttpServer, createServer } from 'http';
import { Server as WebSocketServer } from "ws";
import { Drone } from './drone';
import { requestResult, responseMessage, droneCommand, mapDirection, keyDirection, replaceKeyword } from '../Config/mapping';
import { Response } from './response';

export class DroneWebSocketServer {

    public static readonly PORT: number = 8085;
    private app: express.Application;
    private server: HttpServer;
    private wsServer: WebSocketServer;
    private port: string | number;
    private connectedClient: Map<any, string>;
    private DroneBuffer:  Array<Drone>;

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private config(): void {
        this.port = process.env.PORT || DroneWebSocketServer.PORT;

        this.app.use('/', express.static(path.join(__dirname, '..')));
        this.app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
       
        this.DroneBuffer = new Array<Drone>();
        this.connectedClient = new Map<any, string>();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private sockets(): void {
        this.wsServer = new WebSocketServer({ server: this.server });
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Listening on %s', this.port);
        });

        this.wsServer.on('connection', ws => {
            let clientID = this.getUniqueID();
            ws.send(clientID);
            console.log((new Date()) + ' Connected from ' + clientID);

            this.connectedClient.set(ws, clientID);

            let iDrone = this.startNewDrone(clientID);
            let res = new Response(requestResult.Started, "Drone created.", clientID, iDrone);
            res.setCommandInput(droneCommand.createDrone);
            res.setCommandAction(droneCommand.placeAt);

            ws.send(JSON.stringify(res));

            ws.on('message', message => this.parseCommand(message, ws, clientID));

            ws.on('close', (code, message) => {
                ws.terminate();
                console.log(responseMessage.ConnectionClosed, clientID); 
             });

        });
    }

    private startNewDrone(pClientID: string): Drone {
        let objDrone = new Drone(3, 3, keyDirection[mapDirection.NORTH], pClientID);
        this.DroneBuffer.push(objDrone);
        return objDrone;
    };

    public getApp(): express.Application {
        return this.app;
    }

    private getUniqueID(): string {        
        return this.randS4() + this.randS4() + '-' + this.randS4();
    }

    private randS4():string {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    private parseCommand(message: any, ws: any, pClientID: string): void {
        var affectedDrone: Drone;
        var Request: any;
        var requestClientID: string;         
        var res: Response;
        var connectedClient: any;
        var commandInput: string;
        var commandAction: string;

        try {
            Request = JSON.parse(message);
            let cmdValue = String(Request.Command).toUpperCase();
            commandInput = cmdValue;
            commandAction = commandInput;

            requestClientID = Request.ClientID ? String(Request.ClientID) : pClientID;
            affectedDrone = this.DroneBuffer.find(x => x.getOwner() == requestClientID);
            var reqResult: number;
            var resMessage: string;
            var execution: any;
            switch (cmdValue) {
                case droneCommand.rotateToLeft:
                case droneCommand.rotateToRight:
                    affectedDrone.Rotate(cmdValue);
                    reqResult = requestResult.Succeeded;
                    resMessage = responseMessage.Rotated
                        .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace(replaceKeyword.rotation, cmdValue.toLowerCase());
                    break;

                case droneCommand.moveForward:
                    execution = affectedDrone.Move();
                    reqResult = execution ? requestResult.Succeeded : requestResult.Failed;
                    resMessage = (execution ? responseMessage.MoveSucceeded : responseMessage.MoveFailed)
                        .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase());

                    break;
                case droneCommand.placeAt:
                    if (    Request.cmdArg
                        && Request.cmdArg.x && !isNaN(Request.cmdArg.x) 
                        && Request.cmdArg.y && !isNaN(Request.cmdArg.y)
                        && Request.cmdArg.direction 
                    ) {
                        let objArg = Request.cmdArg;
                        execution = affectedDrone.Place(Number(objArg.x), Number(objArg.y), String(objArg.direction).toUpperCase());

                        reqResult = execution ? requestResult.Succeeded : requestResult.Failed;
                        resMessage = execution
                            ? responseMessage.PlaceSucceeded
                                .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                                .replace(replaceKeyword.position, affectedDrone.getPositionLabel().toLowerCase())
                            : responseMessage.PlaceFailed;
                    } else {
                        reqResult = requestResult.Failed;
                        resMessage = responseMessage.ArgumentsIncomplete;
                    }
                    break;
                case droneCommand.repeatCommand:
                    if (Request.cmdArg && Request.cmdArg.repeatAt) {
                        execution = affectedDrone.Repeat(Number(Request.cmdArg.repeatAt));
                    }
                    else {
                        execution = affectedDrone.Repeat();
                    }

                    let itemRepeat = affectedDrone.getCommandAction(Number(Request.cmdArg.repeatAt));

                    commandAction = itemRepeat.commandAction;

                    reqResult = execution[0] ? requestResult.Succeeded : requestResult.Failed;

                    switch (execution[1]) {
                        case droneCommand.moveForward:
                            resMessage = (execution[0] ? responseMessage.MoveSucceeded : responseMessage.MoveFailed)
                                .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase());
                            break;
                        case droneCommand.rotateToLeft:
                        case droneCommand.rotateToRight:
                            resMessage = responseMessage.Rotated
                                .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                                .replace(replaceKeyword.rotation, execution[1].toLowerCase());
                            break;
                        case droneCommand.placeAt:
                            resMessage = execution[1]
                                ? responseMessage.PlaceSucceeded
                                    .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                                    .replace(replaceKeyword.position, affectedDrone.getPositionLabel().toLowerCase())
                                : responseMessage.PlaceFailed;
                            break;
                    }
                    break;

                case droneCommand.requestRemote:
                    connectedClient = this.requestConnectedClient(pClientID);
                    reqResult = requestResult.ListPushed;
                    resMessage = responseMessage.ConnectedClientsPushed;
                    break;
                case droneCommand.cancelRemote:
                    if (Request.ClientID) {
                        reqResult = requestResult.RemoteDisconnected;
                        resMessage = responseMessage.RemoteDisconnected;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = requestResult.ToBeIgnored;
                        res = new Response(reqResult, resMessage, requestClientID);
                    } else {
                        reqResult = requestResult.Failed;
                        resMessage = responseMessage.ArgumentsIncomplete;
                    }
                    break;
                case droneCommand.enterRemote:
                    if (Request.ClientID) {
                        reqResult = requestResult.RemoteRequested;
                        resMessage = responseMessage.BeingRemoted;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = requestResult.ToBeIgnored;
                        res = new Response(reqResult, resMessage, requestClientID);
                    } else {
                        reqResult = requestResult.Failed;
                        resMessage = responseMessage.ArgumentsIncomplete;                        
                    }
                    break;
                case droneCommand.exitRemote:
                    if (Request.ClientID) {
                        reqResult = requestResult.RemoteClosed;
                        resMessage = responseMessage.RemoteDisconnected;
                        this.pingpongSession(pClientID, Request.ClientID, reqResult, resMessage);
                        reqResult = requestResult.ToBeIgnored;
                        res = new Response(reqResult, resMessage, requestClientID);
                    } else {
                        reqResult = requestResult.Failed;
                        resMessage = responseMessage.ArgumentsIncomplete;
                    }
                    break;
                default:
                    reqResult = requestResult.Failed;
                    resMessage = responseMessage.InvalidCommand;
            }
            
            let remotePrefix = Request.ClientID ? '[REMOTING] ' : '';

            if (reqResult == requestResult.ListPushed) {
                res = new Response(reqResult, resMessage, pClientID, null, connectedClient);
            }else if (reqResult == requestResult.Failed) {
                res = new Response(reqResult, remotePrefix + resMessage, pClientID);
            }
            else if (reqResult != requestResult.ToBeIgnored) {
                res = new Response(reqResult, remotePrefix + resMessage, pClientID, affectedDrone);
                

                if (Request.ClientID && reqResult == requestResult.Succeeded) {
                    let resRemote = this.remoteResponseFactory(pClientID, affectedDrone, cmdValue);
                    resRemote.setCommandInput(commandInput);
                    resRemote.setCommandAction(commandAction);

                    let isBroadcasted = this.broadcastRemoteControl(Request.ClientID, resRemote);    

                    if (!isBroadcasted) {
                        let failedDisconnected = new Response(
                            requestResult.RemoteDisconnected,
                            responseMessage.RemoteDisconnected,
                            pClientID
                        )
                        res = failedDisconnected;
                    }
                }
            }

            if (reqResult != requestResult.ToBeIgnored) {
                res.setCommandAction(commandAction);
                res.setCommandInput(commandInput);
            }
        }
        catch(e) {
            console.log(e);
            reqResult = requestResult.Failed;
            resMessage = responseMessage.ProcessingError;
            res = new Response(reqResult, resMessage, pClientID);

        }
        finally {            
            ws.send(JSON.stringify(res));
        }


    }
    private pingpongSession(requestClientID: string, remotingClientID: string, reqResult: number, resMessage: string): Response {        
        let res = new Response(reqResult, resMessage, requestClientID);
        this.broadcastRemoteControl(remotingClientID, res);
        return res;
    }

    private remoteResponseFactory(pClientID:string, affectedDrone: Drone, cmdValue: string): Response {
            var resRemoteMessage: string;
            switch (cmdValue) {
                case droneCommand.moveForward:
                    resRemoteMessage = responseMessage.MoveRemoted
                        .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace(replaceKeyword.remoter, pClientID);
                    break;
                case droneCommand.rotateToLeft:
                case droneCommand.rotateToRight:
                    resRemoteMessage = responseMessage.RotateRemoted
                        .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace(replaceKeyword.rotation, cmdValue.toLowerCase())
                        .replace(replaceKeyword.remoter, pClientID);
                    break;
                case droneCommand.placeAt:
                    resRemoteMessage = responseMessage.PlaceRemoted
                        .replace(replaceKeyword.direction, affectedDrone.getDirectionLabel().toLowerCase())
                        .replace(replaceKeyword.position, affectedDrone.getPositionLabel().toLowerCase())
                        .replace(replaceKeyword.remoter, pClientID);
                    break;

                case droneCommand.repeatCommand:
                    break;
            }
            return new Response(
                requestResult.Remoted,
                resRemoteMessage,
                pClientID,
                affectedDrone
            );
    }

    private broadcastRemoteControl(remoteClientID: string, res: Response): boolean {
        var IsAlive: boolean = false;
        this.connectedClient.forEach(
            (clientID: string, ws: WebSocket) => {
                if (remoteClientID == clientID) {
                    if (ws.readyState === 1) {
                        ws.send(JSON.stringify(res));    
                        IsAlive = true;
                    } else {
                        this.connectedClient.delete(ws);
                    }
                }
            }
        );

        return IsAlive
    }

    private requestConnectedClient(requestClientID: string): Array<string> {
        let connectedClient = new Array<string>();
        this.connectedClient.forEach(
            (clientID: string, ws: WebSocket) => {
                if (requestClientID != clientID) {
                    if (ws.readyState === 1) {
                        connectedClient.push(clientID);
                    } else {
                        this.connectedClient.delete(ws);
                    }
                }
            }
        )

        return connectedClient;
    }
}

