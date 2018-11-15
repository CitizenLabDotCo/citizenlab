# cl2_back

# Getting started

First you have the latest docker and docker-compose installed.

Build the docker compose images
```
docker-compose up --build -d
```
Some containers will fail, because the database is not setup yet.
On the first run, use these commands to create the database and populate it with some dummy data:

```
docker-compose run --user "$(id -u):$(id -g)" web bundle exec rake db:create

docker-compose run --user "$(id -u):$(id -g)" web bundle exec rake db:reset
```

Mac or Windows:

```
docker-compose run web bundle exec rake db:create

docker-compose run web bundle exec rake db:reset
```


## Executing commands

You can execute commands as if they were running on your local machine, by prepending them with `docker-compose run --user "$(id -u):$(id -g)" --rm web `

Sometimes it's easier to just start a terminal in the rails container and work from there:
```
docker-compose run --user "$(id -u):$(id -g)" --rm web /bin/bash
```

Mac or Windows:

```
docker-compose run --rm web /bin/bash
```

## Handling update

After a git pull, when there are changes in the application, some changes might affect the database model or update the seed data.

This is a fail-safe step process you can apply to handle any update:

```bash
docker-compose down
docker-compose build web
docker-compose run --rm web bundle exec rake db:reset
docker-compose up
```

On Linux, you need to add `--user "$(id -u):$(id -g)"` to all `docker-compose run` commands. This is not required on Mac or Windows.

To save some time, often it is not necessary to run the 2nd time consuming command `docker-compose build web`. This is only required when libraries have been updated, indicated by a change in the `Gemfile.lock` file.

The 3rd step is also not always required. It is needed when

- The database structure has changed, indicated by an update to `db/schema.rb`
- The test data, aka seed data, has changed, indicated by an update to `db/seeds.rb`

## Testing

Resetting the database, with the previous command, upsets the testing database as well. Before running the tests, it's sometimes necessary to put it back in it's default shape. We can do this with the following command:

```
docker-compose run --rm --user "$(id -u):$(id -g)" -e RAILS_ENV=test web rake db:environment:set db:drop db:create db:schema:load
```

Mac or Windows:

```
docker-compose run --rm -e RAILS_ENV=test web rake db:environment:set db:drop db:create db:schema:load
```

To actually run the tests:
```
docker-compose run --rm --user "$(id -u):$(id -g)" web rspec

```

Mac or Windows:

```
docker-compose run --rm web rspec

```

For debugging random test failures, it's can be useful to run the tests multiple times, but stop as soon as on of the test runs fails (for Mac or Windows):

```
for i in `seq 50`; do docker-compose run --rm web rspec ./spec/acceptance/pages_spec.rb; [[ ! $? = 0 ]] && break ; done
```


## Using Customized Tenants for Development

Two environment variables can be used for this purpose: `SEED_SIZE` (e.g. small, medium, large, empty) and `DEFAULT_HOST` (e.g. empty.localhost, dendermonde.citizenlab.co). Set the desired values in the `.env` file and re-build the docker container.

NOTE: Watch out that you don't accidently commit these changes!
