# frozen_string_literal: true

require_relative 'boot'
require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
require 'action_cable/engine'
# require 'active_storage/engine'
# require 'sprockets/railtie'
# require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Cl2Back
  class Application < Rails::Application
    require_dependency Rails.root.join('lib/citizen_lab')
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.0
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.

    config.api_only = true

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end

    config.active_job.queue_adapter = ENV.fetch('ACTIVE_JOB_QUEUE_ADAPTER', 'que').to_sym
    config.action_mailer.deliver_later_queue_name = 'default'
    config.i18n.fallbacks = [I18n.default_locale, { 'nb-NO': [:nb, :no] }]

    ### After https://stackoverflow.com/a/44985745/3585671
    # Without lines below we get an uninitialized constant
    # error from files in the lib directory to other files
    # that need to be loaded.
    config.eager_load_paths << Rails.root.join('lib')

    config.action_dispatch.perform_deep_munge = false
    config.session_store :cookie_store, key: '_interslice_session'
    config.middleware.use ActionDispatch::Cookies # Required for all session management
    config.middleware.use ActionDispatch::Session::CookieStore, config.session_options

    case ENV.fetch('ACTION_MAILER_DELIVERY_METHOD')
    when 'mailgun'
      config.action_mailer.delivery_method = :mailgun
      config.action_mailer.mailgun_settings = {
        api_key: ENV.fetch("MAILGUN_API_KEY"),
        domain: ENV.fetch("MAILGUN_DOMAIN"),
        api_host: ENV.fetch("MAILGUN_API_HOST", "api.mailgun.net"),
      }
    when 'smtp'
      config.action_mailer.delivery_method = :smtp
      config.action_mailer.smtp_settings = {
        address: ENV.fetch('SMTP_ADDRESS'),
        port: ENV.fetch('SMTP_PORT', nil),
        domain:ENV.fetch('SMTP_DOMAIN', nil),
        user_name: ENV.fetch('SMTP_USER_NAME', nil),
        password: ENV.fetch('SMTP_PASSWORD', nil),
        authentication: ENV.fetch('SMTP_AUTHENTICATION', nil)&.to_sym,
        enable_starttls_auto: ENV.fetch('SMTP_ENABLE_STARTTLS_AUTO', nil),
        openssl_verify_mode: ENV.fetch('SMTP_OPENSSL_VERIFY_MODE', nil)
      }.compact
    end

  end
end
