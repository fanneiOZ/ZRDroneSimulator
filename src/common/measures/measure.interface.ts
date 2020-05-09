import { UnitType } from "./unit.type";

export interface MeasureInterface<U extends UnitType> {
    /**
     * @var {number} value
     */
    value: number

    /**
     * @var {U} unit
     */
    unit: U

    // /**
    //  * @constructor
    //  * @param {number} value 
    //  * @param {U} unit
    //  * 
    //  * - Should returns Measurement of Unit with valid attributes 
    //  */
    // constructor(value: number, unit: U): any

    /**
     * @param {MeasureInterface} operator 
     * @returns {MeasureInterface}
     * 
     * - Should returns Measurement of Unit if Operator's Unit is valid
     * - Should throws Error if Operator's Unit is different from Instance's Unit
     */
    add(operator: MeasureInterface<U>): MeasureInterface<U>

    /**
     * @param {MeasureInterface} operator 
     * @returns {MeasureInterface}
     * 
     * - Should returns Measurement of Unit if Operator's Unit is valid
     * - Should throws Error if Operator's Unit is different from Instance's Unit
     */
    substract(operator: MeasureInterface<U>): MeasureInterface<U>

    /**
     * @param {MeasureInterface} operator 
     * @returns {MeasureInterface}
     * 
     * - Should returns Measurement of Unit with same unit as operator
     */
    multiply(operator: MeasureInterface<U>): MeasureInterface<U>
}
