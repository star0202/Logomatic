import { readFile, writeFile } from 'fs/promises'

type Server = {
  id: string
  ignored_channels: string[]
  ignored_users: string[]
  log_channel: string
}

type Data = {
  servers: Server[]
}

export class JSONDatabase {
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private async readFile(): Promise<Data> {
    const fileData = await readFile(this.filePath, 'utf-8')

    return JSON.parse(fileData)
  }

  private async writeFile(data: Data): Promise<void> {
    const fileData = JSON.stringify(data, null, 2)
    await writeFile(this.filePath, fileData, 'utf-8')
  }

  async getServer(id: string): Promise<Server | undefined> {
    const { servers } = await this.readFile()

    return servers.find((server) => server.id === id)
  }

  async updateServer(id: string, server: Server): Promise<void> {
    const data = await this.readFile()

    const index = data.servers.findIndex((server) => server.id === id)

    if (index === -1) {
      data.servers.push(server)
    } else {
      data.servers[index] = server
    }

    await this.writeFile(data)
  }

  async deleteServer(id: string): Promise<void> {
    const data = await this.readFile()

    const index = data.servers.findIndex((server) => server.id === id)
    data.servers.splice(index, 1)

    await this.writeFile(data)
  }
}
