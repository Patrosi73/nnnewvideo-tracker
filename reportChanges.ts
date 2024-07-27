import { type Embed, post } from 'https://deno.land/x/dishooks@v1.1.0/mod.ts'
import config from './config.json' with { type: 'json' }
import { chunkArray, random } from './helpers.ts'
import type { change } from './video.ts'
import { getYouTubeArchives } from './archive.ts'

const botInfo = {
  username: 'NNNewVideo Tracker',
  avatar:
    'https://cdn.discordapp.com/emojis/1083071921584865432.webp?size=256&quality=lossless',
  github: 'https://github.com/jerbear2008/tttakedown-tracker',
}

export async function reportChanges(changes: change[]) {
  console.log(changes.map(change => `Change: ${change.type} in "${change.video.data.title}"`).join('\n'))

  const embeds = (await Promise.all(changes.map(getEmbed))).filter(embed => embed !== null)

  if (embeds.length === 0) {
    return
  }

  const promises: Promise<unknown>[] = []

  for (const chunk of chunkArray(embeds, 10)) {
    for (const webhook of config.reportingWebhooks) {
      promises.push(post(webhook, {
        username: botInfo.username,
        avatar_url: botInfo.avatar,
        embeds: chunk,
      }))
    }
  }
  await Promise.all(promises)
}

export async function getEmbed(change: change): Promise<Embed | null> {
  if (change.type !== 'newVideo') {
    return null
  }

  const basicDetails = {
    author: {
      name: botInfo.username,
      icon_url: botInfo.avatar,
      url: botInfo.github,
    },
    footer: {
      text: 'Running modified tttakedown-tracker',
    },
  }
  const archiveUrl = await getYouTubeArchives(change.video.data.id) ??
    `https://archive.org/details/youtube-${change.video.data.id}`
  
  return {
    ...basicDetails,
    title: `New Video: "${change.video.data.title}"`,
    url: change.video.url,
    color: 2895153, // transparent, #2c2d31
    fields: [
      {
        name: 'ID',
        value: `\`${change.video.data.id}\``,
        inline: true,
      },
      {
        name: 'URL',
        value: change.video.url,
        inline: true,
      },
    ],
    image: {
      url: change.video.data.thumbnailURL,
    },
  }
}