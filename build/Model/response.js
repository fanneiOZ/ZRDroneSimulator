"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(result, message, clientID, resDrone) {
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
        else
            response = { message: message, clientID: clientID };
        this.reqResult = result;
        this.res = response;
    }
}
exports.Response = Response;
