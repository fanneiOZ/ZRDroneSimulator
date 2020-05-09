import { MeasureInterface } from "./measure.interface";
import { LengthUnits } from "./unit.type";

export class Length implements MeasureInterface<LengthUnits> {
    /**
     * @constructor
     * @param {number} value 
     * @param {LengthUnits} unit 
     */
    constructor(public value: number, public unit: LengthUnits) {}

    add(operator: MeasureInterface<LengthUnits>): MeasureInterface<LengthUnits> {
        throw new Error("Method not implemented.");
    }
    substract(operator: MeasureInterface<LengthUnits>): MeasureInterface<LengthUnits> {
        throw new Error("Method not implemented.");
    }
    multiply(operator: MeasureInterface<LengthUnits>): MeasureInterface<LengthUnits> {
        throw new Error("Method not implemented.");
    }
}