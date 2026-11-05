# frozen_string_literal: true

# Moves the standalone built-in SSO login feature flags (facebook_login,
# google_login, azure_ad_login, azure_ad_b2c_login) into the single
# `verification` feature. Each flag's settings are copied into the matching
# entry of `verification.verification_methods`, and the `verification` feature is
# enabled when at least one method was migrated.
#
# Like ConsolidateIdVerificationSettings, the old `*_login` keys are intentionally
# left in `app_configuration.settings` (and kept valid by their definitions in
# `config/schemas/settings.schema.json.erb`) so that the change can be rolled
# back without data loss.
#
# Only methods that were actually active (`enabled` AND `allowed`, i.e.
# `feature_activated?`) are copied across. In the new model, presence in
# `verification_methods` makes a login method active, so a method that was
# configured but switched off is left behind (copying it would silently
# re-activate the login); its credentials remain safe in the old key.
class MoveSsoLoginFlagsToVerificationMethods < ActiveRecord::Migration[7.1]
  # old feature flag name => verification method name
  FEATURE_MAP = {
    'facebook_login' => 'facebook',
    'google_login' => 'google',
    'azure_ad_login' => 'azureactivedirectory',
    'azure_ad_b2c_login' => 'azureactivedirectory_b2c'
  }.freeze

  def up
    return if Apartment::Tenant.current == 'public'

    config = AppConfiguration.instance
    return unless config

    settings = config.settings
    verification = settings['verification'] ||= { 'allowed' => false, 'enabled' => false }
    methods = verification['verification_methods'] ||= []
    migrated_any = false

    FEATURE_MAP.each do |feature_name, method_name|
      # The old feature key is left in place (see the note above) so that the
      # change can be rolled back; here we only copy its settings across.
      feature = settings[feature_name]
      next if feature.nil?

      # Only migrate methods that were actually active (enabled && allowed).
      next unless feature['enabled'] && feature['allowed']

      entry = methods.find { |m| m['name'] == method_name }
      unless entry
        entry = { 'name' => method_name }
        methods << entry
      end
      # Copy every configured parameter; the old and new keys are identical.
      entry.merge!(feature.except('allowed', 'enabled'))

      migrated_any = true
    end

    if migrated_any
      verification['allowed'] = true
      verification['enabled'] = true
    end

    # Drop any keys that are no longer defined in the (now trimmed) settings
    # schema — notably the legacy `*_login` SSO flags removed in TAN-7920. They
    # are still present in stored tenant settings, and re-saving the whole hash
    # would otherwise fail `additionalProperties` validation. This is the same
    # mechanism as the cl2back:clean_tenant_settings task; running it here makes
    # the migration self-contained instead of depending on that task running
    # later in the deploy.
    config.settings = settings
    config.cleanup_settings
    config.save!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
