import {container} from 'tsyringe'
import {App} from './app'

const app = App.resolve(container)
app.start();
