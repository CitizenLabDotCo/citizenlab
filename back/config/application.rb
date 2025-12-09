require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
# require "active_storage/engine"
require 'action_controller/railtie'
require 'action_mailer/railtie'
# require "action_mailbox/engine"
# require "action_text/engine"
require 'action_view/railtie'
require 'action_cable/engine'
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Cl2Back
  class Application < Rails::Application
    require_dependency Rails.root.join('lib/citizen_lab')

    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.2

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end

    config.active_job.queue_adapter = ENV.fetch('ACTIVE_JOB_QUEUE_ADAPTER', 'que').to_sym
    config.action_mailer.deliver_later_queue_name = 'default'

    config.i18n.fallbacks = [I18n.default_locale, { 'nb-NO': %i[nb no], 'sr-SP': %i[sr-Cyrl] }]

    ### After https://stackoverflow.com/a/44985745/3585671
    # Without lines below we get an uninitialized constant
    # error from files in the lib directory to other files
    # that need to be loaded.
    config.eager_load_paths << Rails.root.join('lib')

    config.action_dispatch.perform_deep_munge = false
    config.session_store :cookie_store, key: '_interslice_session'

    # https://github.com/AzureAD/omniauth-azure-activedirectory/issues/22#issuecomment-1259340380
    # It's weird that returning nil in `cookies_same_site_protection` works because `lax` is default
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#lax
    # And this config creates this header: `Set-Cookie: _interslice_session=...; path=/; HttpOnly`
    # So, lax should be used by default in most browsers. But it works both in Chrome and Firefox.
    #
    # If it stops working, we can change `session_store` config to sth like this:
    # config.session_store :cookie_store, key: '_interslice_session', same_site: :none, secure: true
    # (same_site also accepts a lambda)
    config.action_dispatch.cookies_same_site_protection = lambda { |request|
      # We use `none` SameSite attribute for SSO providers that send response using form post (and don't support redirect).
      # Omniauth uses session cookie to send a nonce and verify it on the callback.
      # If SameSite attribute is set to `lax` or `strict`, the session cookie is not sent
      # with the form post. But it's sent if redirect is used instead of form post (all other SSO providers).
      # When the cookie is not sent, the nonce verification fails.

      sso_providers_with_form_post = %w[azureactivedirectory nemlog_in azureactivedirectory_b2c]
      return if sso_providers_with_form_post.any? { request.path.starts_with?("/auth/#{_1}") }

      :lax
    }

    config.middleware.use ActionDispatch::Cookies # Required for all session management
    config.middleware.use ActionDispatch::Session::CookieStore, config.session_options

    # Dump the database schema as SQL (`structure.sql`) instead of Ruby (`schema.rb`).
    config.active_record.schema_format = :sql
    # Extra flags to pass to `pg_dump` when dumping the database schema. With these
    # flags, the resulting `structure.sql` file will contain commands to drop the
    # database objects before creating them. This fixes the error:
    #   ERROR: schema "public" already exists
    # (The public schema is already created because it is part of the search path
    # defined in `config/database.yml`.)
    ActiveRecord::Tasks::DatabaseTasks.structure_dump_flags = %w[--clean --if-exists]

    case ENV.fetch('ACTION_MAILER_DELIVERY_METHOD')
    when 'mailgun'
      config.action_mailer.delivery_method = :mailgun
      config.action_mailer.mailgun_settings = {
        api_key: ENV.fetch('MAILGUN_API_KEY'),
        domain: ENV.fetch('MAILGUN_DOMAIN'),
        api_host: ENV.fetch('MAILGUN_API_HOST', 'api.mailgun.net')
      }
    when 'smtp'
      config.action_mailer.delivery_method = :smtp
      config.action_mailer.smtp_settings = {
        address: ENV.fetch('SMTP_ADDRESS'),
        port: ENV.fetch('SMTP_PORT', nil),
        domain: ENV.fetch('SMTP_DOMAIN', nil),
        user_name: ENV.fetch('SMTP_USER_NAME', nil),
        password: ENV.fetch('SMTP_PASSWORD', nil),
        authentication: ENV.fetch('SMTP_AUTHENTICATION', nil)&.to_sym,
        enable_starttls_auto: ENV.fetch('SMTP_ENABLE_STARTTLS_AUTO', nil),
        openssl_verify_mode: ENV.fetch('SMTP_OPENSSL_VERIFY_MODE', nil)
      }.compact
    end
  end
end
