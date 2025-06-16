import { Bot, Context } from "grammy"
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate"
import { autoRetry } from "@grammyjs/auto-retry"

const token = process.env.BOT_TOKEN
if (!token) throw new Error("BOT_TOKEN environment variable is not set")

type TheContext = HydrateFlavor<Context>

const bot = new Bot<TheContext>(token)
bot.use(hydrate())

bot.api.config.use(autoRetry())

bot.on(["message::url", "message::text_link"], async ctx => {
  const links = ctx
    .entities("text_link")
    .map(e => e.url)
    .concat(ctx.entities("url").map(e => e.text))
  const immo = links.find(link => link.includes("immobiliare.it"))
  if (immo) {
    const url = new URL(immo)
    const id = url.pathname.match(/\/(\d+)\//)?.[1]
    if (id) {
      await ctx.reply(`Immo ID: ${id}`)
    } else {
      await ctx.reply("Immo ID not found in the URL.")
    }
  }
})

bot.catch(err => {
  console.error("Error occurred:", err)
})

export function botStart() {
  void bot.start({
    onStart: async me => {
      console.log(`Bot started with username: @${me.username}, ID: ${me.id}`)
    },
  })
}
