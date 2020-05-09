import { WeightUnits, LengthUnits, DefaultUnits, UnitType } from '../../../src/common/measures/unit.type'

describe('Unit Types', () => {
    describe('LengthUnits', () => {
        test.each`
            expectedProperty    | expectedValue
            ${'pixel'}          | ${'px'}
            ${'centimeter'}     | ${'cm'}
        `('have property $expectedProperty with value $expectedValue', ({expectedProperty, expectedValue}) => {
            expect(LengthUnits).toHaveProperty(expectedProperty, expectedValue)
        })
    })

    describe('WeightUnits', () => {
        test.each`
            expectedProperty    | expectedValue
            ${'kilogram'}       | ${'kg'}
        `('have property $expectedProperty with value $expectedValue', ({expectedProperty, expectedValue}) => {
            expect(WeightUnits).toHaveProperty(expectedProperty, expectedValue)
        })
    })

    describe('DefaultUnits', () => {
        test.each`
            expectedProperty    | expectedValue
            ${'unit'}           | ${'u'}
        `('have property $expectedProperty with value $expectedValue', ({expectedProperty, expectedValue}) => {
            expect(DefaultUnits).toHaveProperty(expectedProperty, expectedValue)
        })
    })
})