# README

NOTE: all these commands should be run from the `./front` folder.

## Run tests automatically

TODO

## Run tests manually in the container (debugging)

Build storybook (if you haven't already):

```sh
npm run storybook:build
```

Pull latest image from docker hub (if you haven't already):

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

Serve storybook by running the following command and wait a few seconds until the server is running:

```sh
http-server -p 6006 ./storybook-static &
```

Run snapshot tests:

```sh
npm run snapshots
```
