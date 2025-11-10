require 'active_support/core_ext/integer/time'

# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # [] => Cross-origin requests are NOT allowed from any origin.
  # ['*'] => Cross-origin requests from any origin are allowed.
  # ['http://some-domain.com', 'https://other-domain.com'] => Cross-origin requests are allowed from specified origins.
  config.allowed_cors_origins = []

  # While tests run files are not watched, reloading is not necessary.
  config.enable_reloading = false

  # Eager loading loads your entire application. When running a single test locally,
  # this is usually not necessary, and can slow down your test suite. However, it's
  # recommended that you enable it in continuous integration systems to ensure eager
  # loading is working properly before deploying your code.
  config.eager_load = ENV['CI'].present?

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=#{1.hour.to_i}"
  }
  # Show full error reports and disable caching.
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false
  # Caching must be turned on for Rack::Attack to work and Rack::Attack tests to pass.
  config.cache_store = :memory_store

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = :none

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Disable caching for Action Mailer templates even if Action Controller
  # caching is enabled.
  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Unlike controllers, the mailer instance doesn't have any context about the
  # incoming request so you'll need to provide the :host parameter yourself.
  config.action_mailer.default_url_options = { host: 'example.org' }

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  config.log_level = :error
  config.active_record.verbose_query_logs = false

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raises error for missing translations.
  config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Raise error when a before_action's only/except options reference missing actions.
  config.action_controller.raise_on_missing_callback_actions = false

  # Comment this out and set config.log_level = :debug to see the queries in the logs.
  # STDOUT.sync = true
  # config.rails_semantic_logger.add_file_appender = false
  # config.semantic_logger.add_appender(io: STDOUT, level: config.log_level, formatter: config.rails_semantic_logger.format)

  # config.rails_semantic_logger.semantic   = false
  # config.rails_semantic_logger.started    = true
  # config.rails_semantic_logger.processing = true
  # config.rails_semantic_logger.rendered   = true

  # Uncomment to catch N+1 queries when running tests
  # config.after_initialize do
  #   Bullet.enable = true
  #   Bullet.rails_logger = true
  #   Bullet.bullet_logger = true
  #   Bullet.raise = true # for testing
  # end
end
