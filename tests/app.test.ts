import 'reflect-metadata'
import {App} from '../src/app'
import {container, DependencyContainer} from 'tsyringe'

describe('App', () => {
    let mockedContainer: DependencyContainer
    beforeAll(() => {
        mockedContainer = container
        // TODO: Replace with actual mock of container
    })

    describe('App.resolve', () => {
        test('Should define instance of App', () => {
            expect(App.resolve(mockedContainer)).toBeDefined()
        })
    })

    let app: App
    beforeAll(() => {
        app = App.resolve(mockedContainer)
    })
    describe('App.di', () => {
        test('Should define instance of DependencyContainer', () => {
            expect(app.di).toBeDefined()
            expect(app.di).toBe(mockedContainer)
        })
    })

    describe('App.start', () => {
        test('Should return dummy text', () => {
            expect(app.start()).toBe('start!')
        })
    })
})
