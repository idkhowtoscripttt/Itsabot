const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Slash command
const commands = [
  new SlashCommandBuilder()
    .setName("webhooksend")
    .setDescription("Send messages to a webhook")
    .addStringOption(o =>
      o.setName("url").setDescription("Webhook URL").setRequired(true))
    .addStringOption(o =>
      o.setName("message").setDescription("Message").setRequired(true))
    .addIntegerOption(o =>
      o.setName("count").setDescription("How many times").setRequired(true))
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );

  console.log("Slash commands loaded.");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "webhooksend") {
    const url = interaction.options.getString("url");
    const message = interaction.options.getString("message");
    const count = interaction.options.getInteger("count");

    await interaction.reply(`Sending ${count} messages...`);

    for (let i = 0; i < count; i++) {
      await axios.post(url, {
        content: message
      });
    }

    await interaction.followUp("Done.");
  }
});

client.login(TOKEN);
