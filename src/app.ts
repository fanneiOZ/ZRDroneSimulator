import { DependencyContainer } from "tsyringe"

/**
 * @class App
 */
export class App {
    /**
     * @type {App}
     */
    protected static appInstance: App

    /**
     * @private
     * @constructor
     * @param {DependencyContainer} diContainer
     */
    private constructor(protected diContainer: DependencyContainer) {}

    /**
     * @static
     * @param {DependencyContainer} container
     * @returns {App}
     */
    public static resolve(container: DependencyContainer): App {
        if (this.appInstance === undefined) {
            this.appInstance = new App(container)
        }
        return this.appInstance
    }

    public start() {
        return 'start!';
    }

    /**
     * @returns {DependencyContainer}
     */
    get di(): DependencyContainer {
        return this.diContainer
    }
}
