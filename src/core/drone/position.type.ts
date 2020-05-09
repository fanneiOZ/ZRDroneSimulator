export type Position = {
     /**
     * @type {number} direction - indiciate which direction drone is heading toward to
     */
    direction: number

    /**
     * @type {object} point - indicate absolute position on the table by 2D plane
     */
    point: { x: number, y: number }
}