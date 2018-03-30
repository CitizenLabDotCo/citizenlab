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

Omit the `--user "$(id -u):$(id -g)"` part on mac or windows.


## Executing commands

You can execute commands as if they were running on your local machine, by prepending them with `docker-compose run --user "$(id -u):$(id -g)" --rm web `

Sometimes it's easier to just start a terminal in the rails container and work from there:
```
docker-compose run --user "$(id -u):$(id -g)" --rm web /bin/bash
```
Omit the `--user "$(id -u):$(id -g)"` part on mac or windows.


## Handling update

After a git pull, when there are changes in the application, some changes might affect the database model or update the seed data.


```
docker-compose run --rm --user "$(id -u):$(id -g)" web bash -c "sleep 5 && bundle exec rake db:reset RAILS_ENV=development"
```

Afterwards you can run the normal `docker-compose up --build`


## Testing

Resetting the database, with the previous command, upsets the testing database as well. Before running the tests, it's sometimes necessary to put it back in it's default shape. We can do this with the following command:

```
docker-compose run --rm --user "$(id -u):$(id -g)" -e RAILS_ENV=test web rake db:environment:set db:drop db:create db:schema:load
```

To actually run the tests:
```
docker-compose run --rm --user "$(id -u):$(id -g)" web rspec

```


## Using Customized Tenants for Development

Two environment variables can be used for this purpose: `SEED_SIZE` (e.g. small, medium, large, empty) and `DEFAULT_HOST` (e.g. empty.localhost, dendermonde.citizenlab.co). Set the desired values in the `.env` file and re-build the docker container.

NOTE: Watch out that you don't accidently commit these changes!
