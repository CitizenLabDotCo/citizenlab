# Analytics
New analytics engine

## How to run the additional required docker container

To run docker with analytics enabled

`docker-compose --profile analytics up -d`

## Installation

1. Run this when you first install the application:

```
docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "psql -h localhost -U postgres cl2_analytics -c 'CREATE DATABASE cl2_analytics;'"
```

2. To sync data from your main DB to the analytics DB run the following command

```
docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "pg_dump --clean -h postgres -U postgres cl2_back_development | psql -h localhost -U postgres cl2_analytics"
```

3. TRUNCATE the localhost.schema_migrations table in your analytics DB

4. Add the following to citizenlab.config.ee.json:

`"commercial/analytics": true`

5. Docker Rebuild required?

## Database

There is a secondary database connection set up to cl_back_analytics - however it currently is ignoring appartment and 
only using a single schema. There is currently a setting in the DB config to make it use 'localhost' so we can develop
on our default localhost tenant.

## Running migrations:

### Important

Views can't currently be read from the engine folder, but the migrations are configured to run from here.
Run the following command on cl-back-web to ensure views are copied to the main migrations folder before running:

`cp -r /cl2_back/engines/commercial/analytics/db/views/*.sql /cl2_back/db/views && rails db:migrate:analytics`

To rollback:

`rails db:rollback:analytics`

## Creating a view migration

Views/tables should be named as follows:

* analytics_dimension_*
* analytics_fact_*

## TODO:

* Create a view model with relations
* Fix multi-tenancy
* Set up a refresh job - rake file to trigger views in order?

Note: Currently scenic doesn't support creating migrations & views inside the engine.
Views can be run by migrations only from /db/views in the main app.
There is an open pull request for this: https://github.com/scenic-views/scenic/pull/357


