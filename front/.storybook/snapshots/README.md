# README

NOTE: all these commands should be run from the `./front` folder.

## Run tests automatically

TODO

## Run tests manually in the container (debugging)

Build storybook (if you haven't already):

```sh
npm run storybook:build
```

Pull image from docker hub (if you haven't already):

```sh
docker pull citizenlabdotco/cl2-devops-front-test
```

Run image:

```sh
docker compose -f .storybook/snapshots/docker-compose.yml up
```

On another tab, enter container:

```sh
docker exec -it snapshots-snapshots-1 /bin/sh
```

Go into the `cl2_front` folder (mounted volume of `./front`):

```sh
cd cl2_front
```

Serve storybook by running command and waiting a bit:

```sh
npm run storybook:serve &
```

Run snapshot tests:

```sh
npm run snapshots
```