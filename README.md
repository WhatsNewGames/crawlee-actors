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

Fork this repo and add copy duplicate `packages/star-citizen` under `packages/<game-slug>`.

```sh
# <game-slug> should be the same as the one use on What's New Games if possible
# Go to https://whatsnew.games and search for the game you want to create a crawler for
# The URL will look like https://whatsnew.games/game/horizon-forbidden-west
# The slug is the part after `game/`, i.e. `horizon-forbidden-west` in this case
cp -a `packages/star-citizen` `packages/<game-slug>`
```

Now you also need to:

- Edit `packages/<game-slug>/apify.json` `name` and `env.FOLDER` keys to match `<game-slug>`
- Edit `packages/<game-slug>/INPUT_SCHEMA.json` `title` and `description` keys to match the right game
- Edit `packages/<game-slug>/package.json` `name`, `description` and `scripts['apify:push']` keys to match the right game

Then check the steps of [I want to edit a crawler](#i-want-to-edit-a-crawler).

## Documentation reference

- [Crawlee](https://crawlee.dev)
- [Apify SDK v3](https://sdk.apify.com)
- [Apify Actor documentation](https://docs.apify.com/actor)
- [Apify CLI](https://docs.apify.com/cli)
