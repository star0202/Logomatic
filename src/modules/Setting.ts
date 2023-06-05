import { database } from '../utils'
import {
  Extension,
  applicationCommand,
  option,
  ownerOnly,
} from '@pikokr/command.ts'
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
} from 'discord.js'

class Setting extends Extension {
  @ownerOnly
  @applicationCommand({
    type: ApplicationCommandType.ChatInput,
    name: 'set',
    description: '[OWNER] Set log channel',
  })
  async set(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Log channel',
    })
    channel?: string
  ) {
    if (!i.guild) return

    await i.deferReply()

    const server = await database.getServer(i.guild.id)

    const chn = channel ?? i.channelId

    if (!server) {
      await database.updateServer(i.guild.id, {
        id: i.guild.id,
        ignored_channels: [],
        ignored_users: [],
        log_channel: chn,
      })

      await i.editReply(`✅ Log channel set to <#${chn}>`)
    } else {
      await database.updateServer(i.guild.id, {
        ...server,
        log_channel: chn,
      })

      await i.editReply(`✅ Log channel changed to <#${chn}>`)
    }
  }

  @ownerOnly
  @applicationCommand({
    type: ApplicationCommandType.ChatInput,
    name: 'ignore',
    description: '[OWNER] Ignore channel or user',
  })
  async ignore(
    i: ChatInputCommandInteraction,
    @option({
      type: ApplicationCommandOptionType.Channel,
      name: 'channel',
      description: 'Channel to ignore',
    })
    channel?: string,
    @option({
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'User to ignore',
    })
    user?: string
  ) {
    if (!i.guild) return

    await i.deferReply()

    const server = await database.getServer(i.guild.id)

    if (!server) {
      await i.editReply(`❌ Log channel not set`)
      return
    }

    if (channel) {
      if (server.ignored_channels.includes(channel)) {
        await database.updateServer(i.guild.id, {
          ...server,
          ignored_channels: server.ignored_channels.filter(
            (chn) => chn !== channel
          ),
        })
        await i.editReply(`✅ <#${channel}> removed from ignored channels`)
      } else {
        await database.updateServer(i.guild.id, {
          ...server,
          ignored_channels: [...server.ignored_channels, channel],
        })
        await i.editReply(`✅ <#${channel}> added to ignored channels`)
      }
    }

    if (user) {
      if (server.ignored_users.includes(user)) {
        await database.updateServer(i.guild.id, {
          ...server,
          ignored_users: server.ignored_users.filter((u) => u !== user),
        })
        await i.editReply(`✅ <@${user}> removed from ignored users`)
      } else {
        await database.updateServer(i.guild.id, {
          ...server,
          ignored_users: [...server.ignored_users, user],
        })
        await i.editReply(`✅ <@${user}> added to ignored users`)
      }
    }
  }

  @ownerOnly
  @applicationCommand({
    type: ApplicationCommandType.ChatInput,
    name: 'list',
    description: '[OWNER] List settings',
  })
  async list(i: ChatInputCommandInteraction) {
    if (!i.guild) return

    await i.deferReply()

    const server = await database.getServer(i.guild.id)

    if (!server) {
      await i.editReply(`❌ Log channel not set`)
      return
    }

    await i.editReply(
      `Log channel: <#${
        server.log_channel
      }>\nIgnored channels: ${server.ignored_channels
        .map((chn) => `<#${chn}>`)
        .join(', ')}\nIgnored users: ${server.ignored_users
        .map((u) => `<@${u}>`)
        .join(', ')}`
    )
  }
}

export const setup = async () => {
  return new Setting()
}
