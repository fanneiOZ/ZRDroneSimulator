"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(result, message, clientID, resDrone, connectedClient) {
        var response;
        if (resDrone) {
            var pDrone;
            if (clientID != resDrone.getOwner()) {
                pDrone = {
                    Owner: resDrone.getOwner(),
                    Position: resDrone.getPosition(),
                    Direction: resDrone.getDirection()
                };
            }
            else {
                pDrone = {
                    Position: resDrone.getPosition(),
                    Direction: resDrone.getDirection()
                };
            }
            response = { message: message, clientID: clientID, drone: pDrone };
        }
        else if (connectedClient)
            response = { message: message, clientID: clientID, connectedClient: connectedClient };
        else
            response = { message: message, clientID: clientID };
        this.reqResult = result;
        this.res = response;
    }
    setCommandInput(cmd) { this.commandInput = cmd; }
    setCommandAction(cmd) { this.commandAction = cmd; }
}
exports.Response = Response;
