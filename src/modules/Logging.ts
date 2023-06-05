import { COLORS } from '../constants'
import { chunkedFields, database, diff, isIgnored } from '../utils'
import { Extension, listener } from '@pikokr/command.ts'
import type { GuildMember, Message, TextBasedChannel } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js'

class Logging extends Extension {
  @listener({ event: 'messageUpdate' })
  async messageUpdateLogger(before: Message, after: Message) {
    if (!before.guild) return

    const server = await database.getServer(before.guild.id)

    if (!server) return

    if (
      await isIgnored(before.guild.id, {
        chn: before.channel,
        user: before.author,
      })
    )
      return

    const channel = (await before.guild.channels.fetch(
      server.log_channel
    )) as TextBasedChannel

    const msgDiff = diff(after, before)

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Update')
          .setColor(COLORS.YELLOW)
          .setAuthor({
            name: `${after.author.tag} (${after.author.id})`,
            iconURL: after.author.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${after.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${after.channelId}>`, inline: true },
            ...chunkedFields('Original', msgDiff.original),
            ...chunkedFields('Updated', msgDiff.updated)
          ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(after.url)
            .setLabel('Go To Message')
        ),
      ],
    })
  }

  @listener({ event: 'messageDelete' })
  async messageDeleteLogger(msg: Message) {
    if (!msg.guild) return

    const server = await database.getServer(msg.guild.id)

    if (!server) return

    if (
      await isIgnored(msg.guild.id, {
        chn: msg.channel,
        user: msg.author,
      })
    )
      return

    const channel = (await msg.guild.channels.fetch(
      server.log_channel
    )) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Deleted')
          .setColor(COLORS.RED)
          .setAuthor({
            name: `${msg.author.tag} (${msg.author.id})`,
            iconURL: msg.author.displayAvatarURL(),
          })
          .addFields(
            { name: 'User', value: `<@${msg.author.id}>`, inline: true },
            { name: 'Channel', value: `<#${msg.channelId}>`, inline: true },
            ...chunkedFields('Content', msg.content)
          ),
      ],
    })
  }

  @listener({ event: 'guildMemberAdd' })
  async memberJoinLogger(member: GuildMember) {
    if (!member.guild) return

    const server = await database.getServer(member.guild.id)

    if (!server) return

    if (
      await isIgnored(member.guild.id, {
        user: member.user,
      })
    )
      return

    const channel = (await member.guild.channels.fetch(
      server.log_channel
    )) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Joined')
          .setColor(COLORS.GREEN)
          .setAuthor({
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    })
  }

  @listener({ event: 'guildMemberRemove' })
  async memberLeaveLogger(member: GuildMember) {
    if (!member.guild) return

    const server = await database.getServer(member.guild.id)

    if (!server) return

    if (
      await isIgnored(member.guild.id, {
        user: member.user,
      })
    )
      return

    const channel = (await member.guild.channels.fetch(
      server.log_channel
    )) as TextBasedChannel

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Left')
          .setColor(COLORS.RED)
          .setAuthor({
            name: `${member.user.tag} (${member.user.id})`,
            iconURL: member.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    })
  }
}

export const setup = async () => {
  return new Logging()
}
