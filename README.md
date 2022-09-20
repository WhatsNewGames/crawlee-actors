# What's New Games crawlers

All crawlers used by What's New Games are referenced in this monorepo.

## I want to edit a crawler

Fork this repo and clone your fork onto your machine. Then:

```sh
# install dependencies with pnpm (mandatory)
pnpm install
# cd to the folder of the game you want to edit
cd packages/<game-slug>
# check that it works out-of-the-box
pnpm run start
# here you should have a packages/<game-slug>/storage folder generate with the result of the crawler

# remove this folder if your want to start another run:
rm -rf packages/<game-slug>/storage
```

Then you should be ready to edit the source under `packages/<game-slug>/src` directory.

Last step would be to create a Pull Request onto this repo.
Once merged, it shouldn't be long before its data is imported into What's New Games.

## I want to create a new crawler

Run the following command. It will prompt for necessary information:

```sh
pnpm run create-actor

# ? Game slug
# ? Game name
# ? Package folder (created under ./packages)
# ? Dataset ID
# ? Request Queue ID
```

_Game slug_ and _Game name_ are mandatory. Keep default values for the rest unless you know what you are doing.
_Game slug_ can be found on [What's New Games](https://whatsnew.games):

- Search for the game you want to add
- Click on it. The URL will look like `https://whatsnew.games/game/star-citizen`
- The _Game slug_ is the part after `/game/`, i.e. `star-citizen` in this example

Then check the steps of [I want to edit a crawler](#i-want-to-edit-a-crawler).

## Documentation reference

- [Crawlee](https://crawlee.dev)
- [Apify SDK v3](https://sdk.apify.com)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
