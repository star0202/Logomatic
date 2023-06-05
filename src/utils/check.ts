import { database } from './database'
import type { Channel, User } from 'discord.js'

export const isIgnored = async (
  guild: string,
  values?: {
    chn?: Channel
    user?: User
  }
): Promise<boolean> => {
  if (!values) return true

  const server = await database.getServer(guild)

  if (values.chn) {
    if (server && server.ignored_channels.includes(values.chn.id)) {
      return true
    }
  }

  if (values.user) {
    if (server && server.ignored_users.includes(values.user.id)) {
      return true
    }

    if (values.user.bot) {
      return true
    }
  }

  return false
}
