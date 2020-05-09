import { MeasureInterface } from '../../../src/common/measures/measure.interface'
import { LengthUnits } from '../../../src/common/measures/unit.type'
import { Length } from '../../../src/common/measures/length'

describe('Length', () => {
    /**
     * GIVEN I create new instance of Measure Class of Unit
     */
    let testingMeasure: any
    

    describe('Class Constructor', () => {
        /**
         * GIVEN value = 10 AND unit is LengthUnits.pixel
         * WHEN I call new Length(value, unit)
         * THEN It should return value
         * * Have property value = 10
         * * Have property unit = px
         */
        test('Should constructor returns instance of Length', () => {
            const instance = new Length(10, LengthUnits.pixel)
            expect(instance).toBeTruthy()
            expect(instance).toEqual({ value: 10, unit: 'px' })
        })

    })

    /**
     * SCENARIO Length should implement valid add operation
     */
    describe('Add Operation', () => {
        test('Should receive instance of Length', () => {

        })
    })

})