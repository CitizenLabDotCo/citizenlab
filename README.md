# cl2_back

# Getting started

First you have the latest docker and docker-compose installed.

Build the docker compose images
```
docker-compose up --build -d
```
Some containers will fail, because the database is not setup yet.
On the first run, use this command to create the database and populate it with some dummy data:

```
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
docker-compose run --user "$(id -u):$(id -g)" web bash -c "sleep 5 && bundle exec rake db:reset RAILS_ENV=development"
```

Afterwards you can run the normal `docker-compose up --build`