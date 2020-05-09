import { Position } from 'src/core/drone/position.type';
import { DroneInterface } from "src/core/drone/drone.interface"


describe('Drone model', () => {
    let testingDrone: DroneInterface
    /**
     * GIVEN testingDrone = new instance of Drone Class
     */
    beforeEach(() => {
        testingDrone = new Drone()
    })
    describe('Position getter', () => {
        /**
         * WHEN I call testingDrone.position()
         * THEN it will return value
         */
        test('Should return position type', () => {            
            expect(testingDrone.position()).toReturn()
        })
    })
})