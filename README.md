# cl2-back

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

### Unit and integration tests
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

For debugging random test failures, it's can be useful to run the tests multiple times, but stop as soon as one of the test runs fails (for Mac or Windows):

```
for i in `seq 50`; do docker-compose run --rm web rspec ./spec/acceptance/pages_spec.rb; [[ ! $? = 0 ]] && break ; done
```

### End-to-end tests

The e2e tests themselves are defined in cl2-front. But they take some assumptions on the available data on the platform, so they can depend on some projects, ideas, users, ... to be there.

This data is defined in `config/tenant_templates/e2etests_template.yml`. The tenant settings are defined in `lib/tasks/create_tenant.rake`.

To (re)load the data and run the e2e tests locally, execute the following command:

```
docker-compose run --rm web bundle exec rake cl2_back:create_tenant[localhost,e2etests_template]
```


## Using Customized Tenants for Development

Two environment variables can be used for this purpose: `SEED_SIZE` (e.g. small, medium, large, empty) and `DEFAULT_HOST` (e.g. empty.localhost, dendermonde.citizenlab.co). Set the desired values in the `.env` file and re-build the docker container.

NOTE: Watch out that you don't accidently commit these changes!


## Using S3 storage in development

1. Go to desired image and/or file uploader.

2. Always include `storage :fog` (comment out if-condition).

3. Comment out `asset_host` method (use original implementation from Carrierwave)


## Creating Engines

In this section, we explain what you need to do (and what you shouldn't forget) when adding a new engine to `cl2-back`. Throughout these instructions, replace "`blorgh`" by the name of your engine.

1. Create a new folder in the `engines` folder and initialize it with an empty `app` folder. Initialize your engine with a nice `README` file.

2. Copy the `bin` folder from another engine (no renamings required).

3. Create a `config` folder with a `config/routes.rb` file initialized as:
```
Blorgh::Engine.routes.draw do

end
```

4. Create a `db` folder and in it an empty `migrate` folder.

5. Create a `lib` folder with an empty `tasks` folder. Copy the `blorgh` folder (with `engine.rb` and `version.rb`) and `blorgh.rb` from another engine and do the necessary renamings in the copied files.

6. Copy over `blorgh.gemspec` and rename (no need to include `MIT-LICENSE` or `Rakefile`), remove/add dependencies if you know what you're doing.

7. Add the following line to your `Gemfile`:
```
gem 'blorgh', path: 'engines/blorgh'
```

8. If you're going to add endpoints to your engine, don't forget to mount it in the main `routes.rb` file.

9. If you added a factory into your engine, you have to add this line to `spec_helper.rb`:
```
require './engines/blorgh/spec/factories/blorghs.rb'
```

10. If you added a gem to `blorgh.gemspec`, you'll also need to `require` it in `lib/blorgh.rb`.

11. If some of your engine's models have relationships with models outside the engine, don't forget to add e.g. `has_many` dependencies in decorator files in you engine's `model` folder.


## Adding smart group rules

1. Create your smart group rule in `lib/smart_group_rules`.

2. Add your new rule to `RULE_TYPE_TO_CLASS` in `app/services/smart_groups_service.rb`.

3. Add a spec to `spec/lib/smart_group_rules/`.

4. Add your rule to `spec/models/group_spec.rb`.

5. Create a frontend task to support the new smart groups rule.


## Running the profiler

1. Run the backend

2. Execute the requests you want to profile

3. Go to http://localhost:4000/profiler.html?pp=normal-backtrace


## Finding back JSON-formatted events from RabbitMQ

1. Run the backend

2. Navigate to `http://localhost:8088` -> `Admin` -> `Tracing`. Log in with `guest`, `guest`.

3. Add a new trace in TEXT (not JSON) format

4. Generate the desired events

5. Click on the trace log file you created on `http://localhost:8088` to see the events


## Disabling Bootsnap

Uncomment `require 'bootsnap/setup'` in `config/boot.rb`


## Troubleshooting

### Rails generate commands result in uninitialized constant errors

This issue was introduced since we're using Zeitwerk for autoloading and remains unresolved. Commenting `config.eager_load = true` in development.rb will allow you to run the command.
