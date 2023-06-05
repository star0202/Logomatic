import { JSONDatabase } from '../structures/Database'

// Because of Circular Deps

export const database = new JSONDatabase('./data.json')
