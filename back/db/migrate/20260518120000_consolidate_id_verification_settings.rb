# frozen_string_literal: true

# Consolidates the standalone `id_*` SSO/verification feature flags into the
# single `verification` feature. Each feature's settings are copied into the
# matching entry of `verification.verification_methods`; features that were
# enabled become active verification methods.
#
# The old `*_login` / `fake_sso` / `kki_location_api` keys are intentionally
# left in `app_configuration.settings` (and kept valid by their definitions in
# `config/schemas/settings.schema.json.erb`) so that the change can be rolled
# back without data loss.
class ConsolidateIdVerificationSettings < ActiveRecord::Migration[7.1]
  # old feature name => [verification method name, { old setting key => new config key }]
  FEATURE_MAP = {
    'acm_login' => ['acm', {}],
    'clave_unica_login' => ['clave_unica', {}],
    'criipto_login' => ['criipto', {}],
    'federa_login' => ['federa', {}],
    'id_austria_login' => ['id_austria', {}],
    'keycloak_login' => ['keycloak', {}],
    'nemlog_in_login' => ['nemlog_in', {}],
    'twoday_login' => ['twoday', {}],
    'fake_sso' => ['fake_sso', { 'issuer' => 'issuer' }],
    'franceconnect_login' => ['franceconnect', {
      'environment' => 'environment',
      'identifier' => 'identifier',
      'secret' => 'secret',
      'version' => 'version',
      'scope' => 'scope'
    }],
    'hoplr_login' => ['hoplr', {
      'environment' => 'environment',
      'client_id' => 'client_id',
      'client_secret' => 'client_secret',
      'neighbourhood_custom_field_key' => 'neighbourhood_custom_field_key'
    }],
    'vienna_citizen_login' => ['vienna_citizen', { 'environment' => 'environment' }],
    'vienna_employee_login' => ['vienna_employee', { 'environment' => 'environment' }],
    'kki_location_api' => ['nemlog_in', {
      'uri' => 'kki_uri',
      'username' => 'kki_username',
      'password' => 'kki_password',
      'custom_headers' => 'kki_custom_headers'
    }]
  }.freeze

  def up
    return if Apartment::Tenant.current == 'public'

    config = AppConfiguration.instance
    return unless config

    settings = config.settings
    verification = settings['verification'] ||= { 'allowed' => false, 'enabled' => false }
    methods = verification['verification_methods'] ||= []
    migrated_any = false

    FEATURE_MAP.each do |feature_name, (method_name, key_map)|
      # The old feature key is left in place (see the note above) so that the
      # change can be rolled back; here we only copy its settings across.
      feature = settings[feature_name]
      next if feature.nil?
      # Only migrate features that were actually turned on.
      next unless feature['enabled']

      entry = methods.find { |m| m['name'] == method_name }
      unless entry
        entry = { 'name' => method_name }
        methods << entry
      end

      key_map.each do |old_key, new_key|
        value = feature[old_key]
        entry[new_key] = value unless value.nil?
      end

      migrated_any = true
    end

    if migrated_any
      verification['allowed'] = true
      verification['enabled'] = true
    end

    config.update!(settings: settings)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
