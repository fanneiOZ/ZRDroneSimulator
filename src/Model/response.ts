import { requestResult } from '../Config/mapping';
import { Drone } from './drone';

export class Response {
    private reqResult: number;
    private res: {
        message: string,
        clientID: string,
        drone?: {
            Owner?: string,
            Position: [number, number],
            Direction: number
        }
        connectedClient?: any
    };
    private commandInput?: string;
    private commandAction?: string; 

    constructor(result: requestResult, message: string, clientID: string, resDrone?: Drone, connectedClient?: any)
    {
        var response: any;

        if (resDrone) {

            var pDrone: any;
            if (clientID != resDrone.getOwner()) {
                pDrone = {
                    Owner: resDrone.getOwner(),
                    Position: resDrone.getPosition(),
                    Direction: resDrone.getDirection()
                };
            } else {
                pDrone = {
                    Position: resDrone.getPosition(),
                    Direction: resDrone.getDirection()
                };
            }
                response = { message: message, clientID: clientID, drone: pDrone };
        } else if (connectedClient)
                response = { message: message, clientID: clientID, connectedClient: connectedClient };
        else    response = { message: message, clientID: clientID };
 
        this.reqResult = result;
        this.res = response;
    }

    public setCommandInput(cmd: string) { this.commandInput = cmd; }
    public setCommandAction(cmd: string) { this.commandAction = cmd; }
}