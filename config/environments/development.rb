Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.  Changed this to true because of the
  # following issue, can be restored to false once this (puma?) issue is
  # resolved:
  # https://github.com/rails/rails/issues/27455
  # https://github.com/puma/puma/issues/1184

  config.eager_load = true # otherwise, active jobs of engines in development cannot find tenants (after the second time)

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join('tmp', 'caching-dev.txt').exist?
    config.action_controller.perform_caching = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
    # config.cache_store = :mem_cache_store,
    #   ENV.fetch('MEMCACHED_HOST'),
    #   { namespace: -> { Apartment::Tenant.current } }
  end

  # Store uploaded files on the local file system (see config/storage.yml for options)
  # config.active_storage.service = :local

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Previewing mails from the email engine.
  config.action_mailer.preview_path = "#{Rails.root}/engines/email_campaigns/spec/mailers/previews"


  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load


  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  # Used by AMS
  Rails.application.routes.default_url_options = {
    host: 'localhost'
  }

  if ENV.fetch('MAILGUN_API_KEY', false)
    config.action_mailer.delivery_method = :mailgun
    config.action_mailer.mailgun_settings = {
      api_key: ENV.fetch("MAILGUN_API_KEY"),
      domain: ENV.fetch("MAILGUN_DOMAIN"),
      api_host: ENV.fetch("MAILGUN_API_HOST", "api.mailgun.net"),
    }
  else
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = { address: 'mailcatcher', port: 1025 }
  end

  # *** Logging

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  if ENV["RAILS_LOG_TO_STDOUT"].present?
    STDOUT.sync = true
    config.rails_semantic_logger.add_file_appender = false
    config.semantic_logger.add_appender(io: STDOUT, level: config.log_level, formatter: config.rails_semantic_logger.format)
  end

  # In development, we want to keep the logs closer to classic rails
  config.rails_semantic_logger.semantic   = false
  config.rails_semantic_logger.started    = true
  config.rails_semantic_logger.processing = true
  config.rails_semantic_logger.rendered   = true

  # No whitelist for host header
  config.hosts = nil

  config.after_initialize do
    Bullet.enable = true
    Bullet.rails_logger = true
    Bullet.bullet_logger = true
    # Bullet.sentry = true # for staging
    # Bullet.raise = true # for testing

    # Bullet.stacktrace_includes = [ 'your_gem', 'your_middleware' ]
    # Bullet.stacktrace_excludes = [ 'their_gem', 'their_middleware', ['my_file.rb', 'my_method'], ['my_file.rb', 16..20] ]
  end
end
