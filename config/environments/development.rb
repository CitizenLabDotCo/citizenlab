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


  # Either value for this is bad, true being the better choice.
  # When set to true, active jobs of engines will not be able
  # to find tenants in development. When set to false, 
  # descendants of classes will not be found because they are
  # not loaded and therefore notifications will not work.
  # Luckily, this problem is only present in development.
  config.eager_load = true


  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.seconds.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

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

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = { :address => "mailcatcher", :port => 1025 }

end
