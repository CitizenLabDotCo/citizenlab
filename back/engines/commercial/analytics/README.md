# Analytics
New analytics engine

## Usage
How to use Analytics.

To run docker with analytics enabled

`docker-compose --profile analytics up -d`

To sync data from your main DB to the analytics DB run the following command

`docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "pg_dump --clean -h postgres -U postgres cl2_back_development | psql -h localhost -U postgres cl2_analytics"`

Run this when you first install the application:

`docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "psql -h localhost -U postgres cl2_analytics -c 'CREATE DATABASE cl2_analytics;'"`

## Running migrations:
Run this before each migration (have to delete migration if already moved):

`rake analytics:install:migrations`

`rails db:migrate`

`rails db:rollback`

## Notes:

TODO:

Secondary database working - http://www.blrice.net/blog/2016/04/09/one-rails-app-with-many-databases/
Views created via Scenic gem - https://pganalyze.com/blog/materialized-views-ruby-rails

You do not have to move migrations here as they are independent of the main database

Can we move the DB config to the engine?