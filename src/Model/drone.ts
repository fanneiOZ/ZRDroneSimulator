import { mapDirection, mapRotation, tableDimension, keyDirection, droneCommand } from '../Config/mapping';

export class Drone {
    private Owner: string;
    private Position: [number, number];
    private Direction: number;
    private CommandStack: Array<Command>;

    constructor(startX: number, startY: number, startDirection: string, OwnerName: string) {
        this.Owner = OwnerName;
        this.Position = [startX, startY];
        this.Direction = mapDirection[startDirection.toUpperCase()];
        this.CommandStack = new Array<Command>();

        let x = startX; let y = startY; let direction = startDirection;
        let cmdArg = { x, y, direction };
        this.pushCommandStack(droneCommand.placeAt, cmdArg);
    }

    private pushCommandStack(cmd, cmdArg?: any): void {
        if (cmdArg) {
            this.CommandStack.push(new Command(this.CommandStack.length + 1, cmd, cmdArg));
        } else {
            this.CommandStack.push(new Command(this.CommandStack.length + 1, cmd));
        }
    }
    public Report(): [number, number, string] {
        return [this.Position[0], this.Position[1], keyDirection[this.Direction % 4]];
    }

    public Place(placeX: number, placeY: number, placeDirection: string): boolean {
        let moveResult = this.setValidatePosition(placeX, placeY, placeDirection);
        this.Position = [moveResult[1], moveResult[2]];
        this.Direction = moveResult[0] ? mapDirection[placeDirection.toUpperCase()] : this.Direction;
        let x = placeX;
        let y = placeY;
        let direction = placeDirection;
        let cmdArg =  { x, y, direction };
        if (moveResult[0]) this.pushCommandStack(droneCommand.placeAt, cmdArg);
        return moveResult[0];
    }

    public Move(): boolean {
        let moveResult = this.setValidatePosition();
        this.Position = [moveResult[1], moveResult[2]];
        if (moveResult[0]) this.pushCommandStack(droneCommand.moveForward);
        return moveResult[0];
    }

    public Rotate(RotateTo: string): void {
        this.Direction += mapRotation[RotateTo.toUpperCase()];
        this.pushCommandStack(mapRotation[RotateTo.toUpperCase()] > 0 ? droneCommand.rotateToLeft : droneCommand.rotateToRight);
    }

    public Repeat(indexCmd?: number): [boolean , string ] {
        let executeAt = indexCmd ? indexCmd : this.CommandStack.length;
        //console.log('executeAt = ' + executeAt.toString());
        let executeCmd = this.CommandStack.find(x => x.getCmdOrder() == executeAt);
        //console.log(executeCmd);
        var execution: boolean;
        var placeArg: any;
        //console.log(executeCmd.getCmdOrder() + ' ' + executeCmd.getCmdValue());
        switch (executeCmd.getCmdValue()) {
            case droneCommand.moveForward:
                execution = this.Move();
                break;
            case droneCommand.rotateToLeft:
            case droneCommand.rotateToRight:
                this.Rotate(String(executeCmd.getCmdValue()));
                execution = true;
                break;
            case droneCommand.placeAt:
                let placeArg = executeCmd.getCmdArgument();
                execution = this.Place(placeArg.x, placeArg.y, placeArg.direction);
                break;
            default:
                execution = false;
        }
        return [execution, String(executeCmd.getCmdValue())];
    }

    public getOwner(): string {
        return this.Owner;
    }
    public getDirection(): number {
        return this.Direction;
    }
    public getDirectionLabel(): string {
        return keyDirection[String(this.Direction % 4)];
    }
    
    public getPosition(): [number, number] {
        return this.Position;
    }
    public getPositionLabel(): string {
        return '(' + String(this.Position[0]) + ',' + String(this.Position[1]) + ')';
    }

    private setValidatePosition(placeX?: number, placeY?: number, placeDirection?: string): [boolean, number, number] {
        let directTo = placeDirection ? mapDirection[placeDirection.toUpperCase()] : this.Direction;
        let x = placeX ? placeX : this.Position[0] + Math.round(Math.cos(directTo / 2 * Math.PI));
        let y = placeY ? placeY : this.Position[1] + Math.round(Math.sin(directTo / 2 * Math.PI));
        let result = (x > 0 && x <= tableDimension.Width) && (y > 0 && y <= tableDimension.Height);

        if (!result) {
            x = this.Position[0];
            y = this.Position[1];
        }

        return [result, x, y];
    }

    public getCommandAction(repeatAt: number): any {
        console.log(this.CommandStack[repeatAt]);
        let result = {
            commandAction: this.CommandStack.find(x => x.getCmdOrder() == repeatAt).getCmdValue(),
            cmdArg: this.CommandStack.find(x => x.getCmdOrder() == repeatAt).getCmdArgument()
        };
        return result;
    }
}

class Command {
    private cmdOrder: number;
    private cmdValue: string;
    private cmdArguments: { x:number, y:number, direction:string};

    constructor(order: number, cmd: string, cmdArg?: { x: number, y: number, direction: string }) {
        this.cmdOrder = order;
        this.cmdValue = cmd;
        if (cmdArg) this.cmdArguments = cmdArg;
    }

    public getCmdOrder(): number {
        return this.cmdOrder;
    }
    public getCmdValue(): string {
        return this.cmdValue;
    }

    public getCmdArgument(): any {
        return this.cmdArguments;
    }
}