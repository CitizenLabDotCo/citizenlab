# README

NOTE: all these commands should be run from the `./front` folder.

## Running tests locally (hot reload)

Run storybook:

```
npm run storybook
```

In a new tab, run the tests:

```
npm run snapshots
```

## Running tests locally (storybook build)

Build storybook:

```
npm run storybook:build
```

Serve storybook build:

```
npm run storybook:serve
```

In a new tab, run the tests:

```
npm run snapshots
```

## Running tests locally (inside of container, for debugging purposes)

Build the snapshot container:

```
docker build -t snapshots - < .storybook/snapshots/Dockerfile
```

Build storybook:

```
npm run storybook:build
```

Run the container:

```
# TODO can't figure out how to enter /bin/sh or whatever
```
