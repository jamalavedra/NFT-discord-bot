const fetch = require("node-fetch");
const Discord = require("discord.js");
const { openseaEventsUrl } = require("../config.json");

var listingCache = [];
var lastTimestamp = null;

module.exports = {
  name: "listing",
  description: "listing bot",
  interval: 30000,
  enabled: process.env.DISCORD_LISTING_CHANNEL_ID != null,
  async execute(client) {
    if (lastTimestamp == null) {
      lastTimestamp = Math.floor(Date.now() / 1000) - 7200;
    } else {
      lastTimestamp -= 30;
      // 7230
    }
    let newTimestamp = Math.floor(Date.now() / 1000);
    // we're retrieving events from -90 to -30 seconds ago each time, and each query overlaps the previous query by 30 seconds
    // doing this to try to resolve some intermittent issues with events being missed by the bot, suspect it's due to OpenSea api being slow to update the events data
    // duplicate events are filtered out by the listingCache array

    let next = null;
    let newEvents = true;
    let settings = {
      method: "GET",
      headers:
        process.env.OPEN_SEA_API_KEY == null
          ? {}
          : {
              "X-API-KEY": process.env.OPEN_SEA_API_KEY,
            },
    };

    do {
      let url = `${openseaEventsUrl}?collection_slug=${
        process.env.OPEN_SEA_COLLECTION_NAME
      }&event_type=transfer&only_opensea=false&occurred_before=${newTimestamp}${
        next == null ? "" : `&cursor=${next}`
      }`;
      try {
        var res = await fetch(url, settings);
        if (res.status != 200) {
          throw new Error(`Couldn't retrieve events: ${res.statusText}`);
        }

        let data = await res.json();
        next = data.next;

        data.asset_events.forEach(function (event) {
          if (event.asset) {
            if (listingCache.includes(event.id)) {
              newEvents = false;
              return;
            } else {
              listingCache.push(event.id);
              if (listingCache.length > 200) listingCache.shift();
            }

            if (+new Date(event.created_date) / 1000 < lastTimestamp) {
              newEvents = false;
              return;
            }
            if (
              event.asset.description &&
              (event.asset.description
                .toLowerCase()
                .includes("@longlifenation") ||
                event.asset.description.toLowerCase().includes("@lln"))
            ) {
              const embedMsg = new Discord.MessageEmbed()
                .setColor("#0099ff")
                .setTitle(event.asset.name)
                .setURL(event.asset.permalink)
                .setDescription(`${event.asset.description}`)
                .setThumbnail(event.asset.image_url)
                .addField(
                  "By",
                  `[${event.transaction.to_account.address.slice(
                    0,
                    8
                  )}](https://polygonscan.com/address/${
                    event.transaction.to_account.address
                  })`,
                  true
                );

              client.channels
                .fetch(process.env.DISCORD_LISTING_CHANNEL_ID)
                .then((channel) => {
                  channel.send(embedMsg);
                })
                .catch(console.error);
            }
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
