# frozen_string_literal: true

module ConsoleMethods
  def switch(tenant_name)
    Apartment::Tenant.switch! tenant_name
    "Switched to tenant #{Apartment::Tenant.current}"
  end

  def localhost
    switch 'localhost'
  end
end

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # [] => Cross-origin requests are NOT allowed from any origin.
  # ['*'] => Cross-origin requests from any origin are allowed.
  # ['http://some-domain.com', 'https://other-domain.com'] => Cross-origin requests are allowed from specified origins.
  config.allowed_cors_origins = ['*']

  # In the development environment your application's code is reloaded any time
  # it changes. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.enable_reloading = true

  # Do not eager load code on boot.  Changed this to true because of the
  # following issue, can be restored to false once this (puma?) issue is
  # resolved:
  # https://github.com/rails/rails/issues/27455
  # https://github.com/puma/puma/issues/1184
  config.eager_load = true # otherwise, active jobs of engines in development cannot find tenants (after the second time)

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable server timing
  config.server_timing = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true
    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false
    config.cache_store = :null_store
  end

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  # Previewing mails from all engines.
  config.action_mailer.preview_paths = [Rails.root.join('engines/*/*/spec/mailers/previews')]

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  # Used by AMS
  Rails.application.routes.default_url_options = {
    host: 'localhost'
  }

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Highlight code that enqueued background job in logs.
  config.active_job.verbose_enqueue_logs = true

  if ENV['RAILS_LOG_TO_STDOUT'].present?
    $stdout.sync = true
    config.rails_semantic_logger.add_file_appender = false
    config.semantic_logger.add_appender(io: $stdout, level: config.log_level, formatter: config.rails_semantic_logger.format)
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

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Uncomment if you wish to allow Action Cable access from any origin.
  # config.action_cable.disable_request_forgery_protection = true

  # Raise error when a before_action's only/except options reference missing actions
  config.action_controller.raise_on_missing_callback_actions = false

  # rubocop:disable Rails/Output
  console do
    # We use Pry as our Rails console (see https://github.com/pry/pry-rails), so:
    TOPLEVEL_BINDING.eval('self').extend(ConsoleMethods)
    puts
    puts 'Available methods:'
    puts '  `switch(tenant_name)`: switch to given tenant.'
    puts '  `localhost`: switch to localhost (used by default if exists).'
    ActiveRecord::Base.logger.silence { Tenant.find_by(host: 'localhost')&.switch! }
    puts
  end
  # rubocop:enable Rails/Output
end
