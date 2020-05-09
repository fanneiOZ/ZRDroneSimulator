import { Position } from './position.type'
/**
 * Drone Interface

 */
export interface DroneInterface {
    /**
     * @constructor
     * @param {string} id
     * @param {Position} position
     * @returns {DroneInterface}
     */
    constructor(id: string, position: Position): DroneInterface

    /**
     * @var {string} id
     */
    id(): string

    /**
     * @returns {Position}
     */
    position(): Position
    position(newPosition: Position): DroneInterface
}