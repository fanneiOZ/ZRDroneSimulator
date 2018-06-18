"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapDirection = {
    'EAST': 0,
    'NORTH': 1,
    'WEST': 2,
    'SOUTH': 3,
};
exports.keyDirection = {
    '-3': 'NORTH',
    '-2': 'WEST',
    '-1': 'SOUTH',
    '0': 'EAST',
    '1': 'NORTH',
    '2': 'WEST',
    '3': 'SOUTH'
};
exports.mapRotation = {
    'LEFT': 1,
    'RIGHT': -1
};
;
var droneCommand;
(function (droneCommand) {
    droneCommand["createDrone"] = "CREATE";
    droneCommand["rotateToLeft"] = "LEFT";
    droneCommand["rotateToRight"] = "RIGHT";
    droneCommand["moveForward"] = "MOVE";
    droneCommand["placeAt"] = "PLACE";
    droneCommand["repeatCommand"] = "REPEAT";
    droneCommand["requestRemote"] = "REMOTE";
    droneCommand["enterRemote"] = "ENTERREMOTE";
    droneCommand["exitRemote"] = "EXITREMOTE";
    droneCommand["cancelRemote"] = "CANCELREMOTE";
})(droneCommand = exports.droneCommand || (exports.droneCommand = {}));
