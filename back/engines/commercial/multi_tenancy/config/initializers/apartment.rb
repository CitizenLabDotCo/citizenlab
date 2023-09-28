# frozen_string_literal: true

# You can have Apartment route to the appropriate Tenant by adding some Rack middleware.
# Apartment can support many different "Elevators" that can take care of this routing to your data.
# Require whichever Elevator you're using below or none if you have a custom one.
require 'apartment/elevators/generic'

# require 'apartment/elevators/domain'
# require 'apartment/elevators/subdomain'
# require 'apartment/elevators/first_subdomain'
#
# Apartment Configuration
#
Apartment.configure do |config|
  # Add any models that you do not want to be multi-tenanted, but remain in the global (public) namespace.
  # A typical example would be a Customer or Tenant model that stores each Tenant's information.
  config.excluded_models += ['Tenant']

  # In order to migrate all of your Tenants you need to provide a list of Tenant names to Apartment.
  # You can make this dynamic by providing a Proc object to be called on migrations.
  # This object should yield either:
  # - an array of strings representing each Tenant name.
  # - a hash which keys are tenant names, and values custom db config (must contain all key/values required in database.yml)
  #
  # config.tenant_names = lambda{ Customer.pluck(:tenant_name) }
  # config.tenant_names = ['tenant1', 'tenant2']
  # config.tenant_names = {
  #   'tenant1' => {
  #     adapter: 'postgresql',
  #     host: 'some_server',
  #     port: 5555,
  #     database: 'postgres' # this is not the name of the tenant's db
  #                          # but the name of the database to connect to before creating the tenant's db
  #                          # mandatory in postgresql
  #   },
  #   'tenant2' => {
  #     adapter:  'postgresql',
  #     database: 'postgres' # this is not the name of the tenant's db
  #                          # but the name of the database to connect to before creating the tenant's db
  #                          # mandatory in postgresql
  #   }
  # }
  # config.tenant_names = lambda do
  #   Tenant.all.each_with_object({}) do |tenant, hash|
  #     hash[tenant.name] = tenant.db_configuration
  #   end
  # end
  #
  config.tenant_names = -> { Tenant.not_deleted.pluck(:host).map { |h| h.tr('.', '_') } }

  # Enable migrations in parallel.
  parallel_migration_threads = ENV.fetch('PARALLEL_MIGRATION_THREADS', 1).to_i
  if parallel_migration_threads > 1
    # Patch `ActiveRecord` to solve: https://github.com/influitive/apartment/issues/506
    # This solution draws heavily from the discussions in this PR: https://github.com/rails/rails/pull/43500
    # and in particular from this comment: https://github.com/rails/rails/pull/43500#issuecomment-1174949533
    #
    # However, patching `Apartment::Adapters::PostgresqlAdapter` as suggested in the
    # comment did not work (the patched code was not executed during the migrations).
    # So we opted to patch `ActiveRecord::ConnectionAdapters::PostgreSQLAdapter`
    # instead. Patching `ActiveRecord::ConnectionAdapters::PostgreSQLAdapter` is not an
    # acceptable solution for Rails in general as it breaks the thread safety of
    # migrations that touches to multiple schemas. But in our case, all migrations are
    # run at the schema level and are replicated over all schemas. So that's fine. It's
    # not excluded that we can make this work by patching
    # `Apartment::Adapters::PostgresqlAdapter`, but this would require more research and
    # our time budget on this is limited.
    require 'gem_extensions/active_record/migrator'
    require 'gem_extensions/active_record/connection_adapters/abstract_adapter'
    require 'gem_extensions/active_record/connection_adapters/postgre_sql_adapter'
    ActiveRecord::Migrator.prepend(GemExtensions::ActiveRecord::Migrator)
    ActiveRecord::ConnectionAdapters::AbstractAdapter.prepend(GemExtensions::ActiveRecord::ConnectionAdapters::AbstractAdapter)
    ActiveRecord::ConnectionAdapters::PostgreSQLAdapter.prepend(GemExtensions::ActiveRecord::ConnectionAdapters::PostgreSqlAdapter)

    config.parallel_migration_threads = parallel_migration_threads
  end

  # ==> PostgreSQL only options

  # Specifies whether to use PostgreSQL schemas or create a new database per Tenant.
  # The default behaviour is true.
  #
  # config.use_schemas = true

  # Apartment can be forced to use raw SQL dumps instead of schema.rb for creating new schemas.
  # Use this when you are using some extra features in PostgreSQL that can't be respresented in
  # schema.rb, like materialized views etc. (only applies with use_schemas set to true).
  # (Note: this option doesn't use db/structure.sql, it creates SQL dump by executing pg_dump)
  #
  # config.use_sql = false

  # There are cases where you might want some schemas to always be in your search_path
  # e.g when using a PostgreSQL extension like hstore.
  # Any schemas added here will be available along with your selected Tenant.
  #
  config.persistent_schemas = ['shared_extensions']

  # <== PostgreSQL only options
  #

  # By default, and only when not using PostgreSQL schemas, Apartment will prepend the environment
  # to the tenant name to ensure there is no conflict between your environments.
  # This is mainly for the benefit of your development and test environments.
  # Uncomment the line below if you want to disable this behaviour in production.
  #
  # config.prepend_environment = !Rails.env.production?
end

class RescuedApartmentMiddleware < Apartment::Elevators::Generic
  def call(env)
    request = Rack::Request.new(env)

    database = @processor.call(request)

    if database
      Apartment::Tenant.switch(database) { @app.call(env) }
    else
      @app.call(env)
    end
  rescue Apartment::TenantNotFound
    # This allows us to catch the exception from a rails controller
    @app.call(env)
  end

  def parse_tenant_name(request)
    if request.path =~ %r{^/admin_api/.*} || request.path =~ %r{^/okcomputer.*} || request.path == '/hooks/mailgun_events'
      nil
    else
      host = if Rails.env.development? || Rails.env.staging?
        ENV.fetch('OVERRIDE_HOST', request.host)
      else
        request.host
      end
      Tenant.host_to_schema_name(host)
    end
  end
end

# Setup a custom Tenant switching middleware. The Proc should return the name of the Tenant that
# you want to switch to.
# Rails.application.config.middleware.use 'Apartment::Elevators::Generic', lambda { |request|
#   request.host.split('.').first
# }

Rails.application.config.middleware.insert_after ActionDispatch::Session::CookieStore, RescuedApartmentMiddleware

# Rails.application.config.middleware.use RescuedApartmentElevator, Proc.new { |request| puts request.path; request.host.gsub(/\./, "_") }
# Rails.application.config.middleware.use Apartment::Elevators::Domain
# Rails.application.config.middleware.use 'Apartment::Elevators::Subdomain'
# Rails.application.config.middleware.use 'Apartment::Elevators::FirstSubdomain'

# https://github.com/rails-on-services/apartment/tree/2.11.0#callbacks
require 'apartment/adapters/abstract_adapter'

# Registering +switch+ callbacks
Apartment::Adapters::AbstractAdapter.set_callback :switch, :before do
  AppConfiguration.reset_instance
end

Apartment::Adapters::AbstractAdapter.set_callback :switch, :after do |object|
  # It's not always correct. E.g. it's `public` tracking errors by sentry-rails gem in controllers.
  # But still extremely useful for errors in background jobs, rake tasks, and the console.
  Sentry.set_tags(switched_tenant: Tenant.schema_name_to_host(object.current)) if defined?(Sentry)
end

# Patching +AbstractAdapter+ to invalidate the +AppConfiguration+ instance when the
# tenant connection is reset.
module Apartment::Adapters::AbstractAdapterPatch
  def reset
    AppConfiguration.reset_instance
    super
  end
end

Apartment::Adapters::AbstractAdapter.prepend(Apartment::Adapters::AbstractAdapterPatch)
