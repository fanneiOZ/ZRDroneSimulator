"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapping_1 = require("../Config/mapping");
class Drone {
    constructor(startX, startY, startDirection, OwnerName) {
        this.Owner = OwnerName;
        this.Position = [startX, startY];
        this.Direction = mapping_1.mapDirection[startDirection.toUpperCase()];
        this.CommandStack = new Array();
        let x = startX;
        let y = startY;
        let direction = startDirection;
        let cmdArg = { x, y, direction };
        this.pushCommandStack(mapping_1.droneCommand.placeAt, cmdArg);
    }
    pushCommandStack(cmd, cmdArg) {
        if (cmdArg) {
            this.CommandStack.push(new Command(this.CommandStack.length + 1, cmd, cmdArg));
        }
        else {
            this.CommandStack.push(new Command(this.CommandStack.length + 1, cmd));
        }
    }
    Report() {
        return [this.Position[0], this.Position[1], mapping_1.keyDirection[this.Direction % 4]];
    }
    Place(placeX, placeY, placeDirection) {
        let moveResult = this.setValidatePosition(placeX, placeY, placeDirection);
        this.Position = [moveResult[1], moveResult[2]];
        this.Direction = moveResult[0] ? mapping_1.mapDirection[placeDirection.toUpperCase()] : this.Direction;
        let x = placeX;
        let y = placeY;
        let direction = placeDirection;
        let cmdArg = { x, y, direction };
        if (moveResult[0])
            this.pushCommandStack(mapping_1.droneCommand.placeAt, cmdArg);
        return moveResult[0];
    }
    Move() {
        let moveResult = this.setValidatePosition();
        this.Position = [moveResult[1], moveResult[2]];
        if (moveResult[0])
            this.pushCommandStack(mapping_1.droneCommand.moveForward);
        return moveResult[0];
    }
    Rotate(RotateTo) {
        this.Direction += mapping_1.mapRotation[RotateTo.toUpperCase()];
        this.pushCommandStack(mapping_1.mapRotation[RotateTo.toUpperCase()] > 0 ? mapping_1.droneCommand.rotateToLeft : mapping_1.droneCommand.rotateToRight);
    }
    Repeat(indexCmd) {
        let executeAt = indexCmd ? indexCmd : this.CommandStack.length;
        //console.log('executeAt = ' + executeAt.toString());
        let executeCmd = this.CommandStack.find(x => x.getCmdOrder() == executeAt);
        //console.log(executeCmd);
        var execution;
        var placeArg;
        //console.log(executeCmd.getCmdOrder() + ' ' + executeCmd.getCmdValue());
        switch (executeCmd.getCmdValue()) {
            case mapping_1.droneCommand.moveForward:
                execution = this.Move();
                break;
            case mapping_1.droneCommand.rotateToLeft:
            case mapping_1.droneCommand.rotateToRight:
                this.Rotate(String(executeCmd.getCmdValue()));
                execution = true;
                break;
            case mapping_1.droneCommand.placeAt:
                let placeArg = executeCmd.getCmdArgument();
                execution = this.Place(placeArg.x, placeArg.y, placeArg.direction);
                break;
            default:
                execution = false;
        }
        return [execution, String(executeCmd.getCmdValue())];
    }
    getOwner() {
        return this.Owner;
    }
    getDirection() {
        return this.Direction;
    }
    getDirectionLabel() {
        return mapping_1.keyDirection[String(this.Direction % 4)];
    }
    getPosition() {
        return this.Position;
    }
    getPositionLabel() {
        return '(' + String(this.Position[0]) + ',' + String(this.Position[1]) + ')';
    }
    setValidatePosition(placeX, placeY, placeDirection) {
        let directTo = placeDirection ? mapping_1.mapDirection[placeDirection.toUpperCase()] : this.Direction;
        let x = placeX ? placeX : this.Position[0] + Math.round(Math.cos(directTo / 2 * Math.PI));
        let y = placeY ? placeY : this.Position[1] + Math.round(Math.sin(directTo / 2 * Math.PI));
        let result = (x > 0 && x <= 5 /* Width */) && (y > 0 && y <= 5 /* Height */);
        if (!result) {
            x = this.Position[0];
            y = this.Position[1];
        }
        return [result, x, y];
    }
    getCommandAction(repeatAt) {
        console.log(this.CommandStack[repeatAt]);
        let result = {
            commandAction: this.CommandStack.find(x => x.getCmdOrder() == repeatAt).getCmdValue(),
            cmdArg: this.CommandStack.find(x => x.getCmdOrder() == repeatAt).getCmdArgument()
        };
        return result;
    }
}
exports.Drone = Drone;
class Command {
    constructor(order, cmd, cmdArg) {
        this.cmdOrder = order;
        this.cmdValue = cmd;
        if (cmdArg)
            this.cmdArguments = cmdArg;
    }
    getCmdOrder() {
        return this.cmdOrder;
    }
    getCmdValue() {
        return this.cmdValue;
    }
    getCmdArgument() {
        return this.cmdArguments;
    }
}
