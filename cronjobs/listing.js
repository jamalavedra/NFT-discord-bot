const fetch = require("node-fetch");
const Discord = require("discord.js");

var listingCache = [];
var lastTimestamp = null;

module.exports = {
  name: "listing",
  description: "listing bot",
  interval: 30000,
  enabled: process.env.DISCORD_LISTING_CHANNEL_ID != null,
  async execute(client) {
    if (lastTimestamp == null) {
      lastTimestamp = Math.floor(Date.now() / 1000) - 120;
    } else {
      lastTimestamp -= 30;
    }
    let newTimestamp = Math.floor(Date.now() / 1000) - 30;
    // we're retrieving events from -90 to -30 seconds ago each time, and each query overlaps the previous query by 30 seconds
    // doing this to try to resolve some intermittent issues with events being missed by the bot, suspect it's due to OpenSea api being slow to update the events data
    // duplicate events are filtered out by the listingCache array

    let next = null;
    let newEvents = true;
    let settings = {
      method: "GET",
      qs: {
        chain: "polygon",
        page_number: "2",
        include: "metadata",
        refresh_metadata: "true",
      },
      headers:
        process.env.NFTPORT_API_KEY == null
          ? {}
          : {
              "X-API-KEY": process.env.NFTPORT_API_KEY,
            },
    };

    do {
      let url = `https://api.nftport.xyz/v0/nfts/${process.env.CONTRACT_ADDRESS}`;
      try {
        var res = await fetch(url, settings);
        if (res.status != 200) {
          throw new Error(`Couldn't retrieve events: ${res.statusText}`);
        }

        let data = await res.json();

        next = data.next;

        data.nfts.forEach(function (event) {
          if (
            event.metadata &&
            event.metadata.description &&
            (event.metadata.description
              .toLowerCase()
              .includes("#longlifenation") ||
              event.metadata.description.toLowerCase().includes("#pow") ||
              event.metadata.description.toLowerCase().includes("#lnn"))
          ) {
            if (listingCache.includes(event.token_id)) {
              newEvents = false;
              return;
            } else {
              listingCache.push(event.token_id);
              if (listingCache.length > 200) listingCache.shift();
            }

            if (+new Date(event.updated_date) / 1000 < lastTimestamp) {
              newEvents = false;
              return;
            }

            const embedMsg = new Discord.MessageEmbed()
              .setColor("#0099ff")
              .setTitle(event.metadata.name)
              .setURL("https://ipfs.io" + event.metadata.image)
              .setDescription(`new POW`)
              .setThumbnail("https://ipfs.io" + event.asset.image)
              .addField("By", `[0x644..582](https://jamalavedra.me/)`, true);

            client.channels
              .fetch(process.env.DISCORD_LISTING_CHANNEL_ID)
              .then((channel) => {
                channel.send(embedMsg);
              })
              .catch(console.error);
          }
        });
      } catch (error) {
        console.error(error);
        return;
      }
    } while (next != null && newEvents);

    lastTimestamp = newTimestamp;
  },
};
