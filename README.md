# NFT Discord Bot

This is a discord bot for ERC721 NFT collections, all the token metadata is being retrieved from opensea at the moment, instead of directly from the tokenURI in the smart contract.

# Supported functions

The following functions are currently supported:

## Automatic Posts

### **Listings**

The bot will look up sales events on OpenSea every 30 seconds, and all newly created sales listing will be posted to the configured Discord channel.

# Configuration

## Discord Application

You'll need to create a Discord Application first, see https://discord.com/developers/applications

## Bot Configuration

All configuration is done via environment variables, which are as follows:
| Env Var | Description |
| ----------- | ----------- |
| CONTRACT_ADDRESS | Ethereum address for the NFT Smart Contract |
| DISCORD_BOT_TOKEN | Pretty self explanatory |
| DISCORD_SALES_CHANNEL_ID | The discord channel id where sales events should be posted to, should look like a long number. |
| DISCORD_LISTING_CHANNEL_ID | The discord channel id where listing events should be posted to, should look like a long number. |
| DISCORD_TOKEN_COMMAND | The command word you'd like the bot to respond to for posting token information, pick a simple word that represents the collection, see example above |
| OPEN_SEA_API_KEY | Contact OpenSea to request an API key at https://docs.opensea.io/reference#request-an-api-key. OpenSea's Events API now requires the API key and won't work without one. |
| OPEN_SEA_COLLECTION_NAME | The collection slug name on OpenSea, get this from the browser when you are viewing a collection, e.g. the collection name for https://opensea.io/collection/boredapeyachtclub is "**boredapeyachtclub**"|

# Deployment

If running locally, just checkout the repository and run

`npm install`

followed by

`npm start`

You can also deploy directly to Heroku in just a few minutes.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

If you use the free dynos in Heroku, they go to sleep every 30 minutes unless there's a request on the endpoint, you can set up a free cron job online to poll your app every 20 minutes or so to keep it alive. https://cron-job.org/

# proof_of_workout_bot
