# Analytics
New analytics engine

## How to run the docker containers

To run docker with analytics enabled

`docker-compose --profile analytics up -d`

To sync data from your main DB to the analytics DB run the following command

`docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "pg_dump --clean -h postgres -U postgres cl2_back_development | psql -h localhost -U postgres cl2_analytics"`

Run this when you first install the application:

`docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "psql -h localhost -U postgres cl2_analytics -c 'CREATE DATABASE cl2_analytics;'"`

## Installation

Add the following to citizenlab.config.ee.json:

`"commercial/analytics": true`

## Database

There is a secondary database connection set up to cl_back_analytics - however it currently is ignoring appartment and 
only using at the default (public) schema.

## Running migrations:

Migrations are stored within the engine and database.yml is configured to look inside the engine for analytics migrations.

`rails db:migrate:analytics`

`rails db:rollback:analytics`

## Creating a view migration

Views/tables should be named as follows:

analytics_dimension_*
analytics_fact_*

Note: Currently scenic doesn't support creating migrations & views inside the engine.
Views can be run by migrations only from /db/views in the main app. 
There is an open pull request for this: https://github.com/scenic-views/scenic/pull/357

`rails g scenic:view analytics_dimension_*`

`rails g scenic:view analytics_fact_*`

## TODO:

* Create a view model with relations
* Fix multi-tenancy
* Temp script to copy the db to 'public' in the analytics schema
* Set up a refresh job


