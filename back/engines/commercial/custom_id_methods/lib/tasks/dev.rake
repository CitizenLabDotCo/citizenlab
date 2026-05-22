# frozen_string_literal: true

# Enable verification/SSO methods for local development only
# Use `rake dev:enable_id_method[<name>]` to enable a single method
# Use `rake dev:enable_id_method[<name>,<name>]` to enable multiple methods
# Use `rake dev:enable_id_method[all]` to enable every configured methods

# Config for every custom verification/SSO method we support
DEV_ID_METHOD_CONFIGS = {
  # Methods for both identity verification and login/SSO.
  'fake_sso' => {
    'name' => 'fake_sso',
    'method_name_multiloc' => {},
    'enabled_for_verified_actions' => true
    # Set `'issuer' => 'https://fake-sso.onrender.com'` to test with the deployed version of the Fake SSO.
  },
  'bosa_fas' => {
    'name' => 'bosa_fas',
    'environment' => 'integration',
    'identifier' => 'fake_identifier',
    'secret' => 'fake_secret'
  },
  'clave_unica' => {
    'name' => 'clave_unica',
    'client_id' => ENV.fetch('DEFAULT_CLAVE_UNICA_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_CLAVE_UNICA_CLIENT_SECRET', 'fake secret'),
    'enabled_for_verified_actions' => true
  },
  'franceconnect' => {
    'name' => 'franceconnect',
    'environment' => 'integration',
    'version' => 'v2',
    'identifier' => ENV.fetch('DEFAULT_FRANCECONNECT_LOGIN_IDENTIFIER', 'fake id'),
    'secret' => ENV.fetch('DEFAULT_FRANCECONNECT_LOGIN_SECRET', 'fake secret')
  },
  'auth0' => {
    'name' => 'auth0',
    'client_id' => 'fake_client_id',
    'client_secret' => 'fake_client_secret',
    'domain' => 'fake_domain',
    'method_name_multiloc' => { 'en' => 'Verify with Auth0' }
  },
  'nemlog_in' => {
    'name' => 'nemlog_in',
    'environment' => 'pre_production_integration',
    'issuer' => ENV.fetch('DEFAULT_NEMLOG_IN_ISSUER', 'fake issuer'),
    'private_key' => ENV.fetch('DEFAULT_NEMLOG_IN_PRIVATE_KEY', 'fake key'),
    'enabled_for_verified_actions' => true
  },
  'criipto' => {
    'name' => 'criipto',
    'domain' => 'cl-test.criipto.id',
    'client_id' => ENV.fetch('DEFAULT_CRIIPTO_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_CRIIPTO_CLIENT_SECRET', 'fake secret'),
    'identity_source' => 'DK MitID',
    'ui_method_name' => 'MitID (Criipto)',
    'enabled_for_verified_actions' => true
  },
  'id_austria' => {
    'name' => 'id_austria',
    'client_id' => ENV.fetch('DEFAULT_ID_IDAUSTRIA_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_ID_IDAUSTRIA_CLIENT_SECRET', 'fake secret'),
    'ui_method_name' => 'ID Austria',
    'enabled_for_verified_actions' => true
  },
  'keycloak' => {
    'name' => 'keycloak',
    'provider' => ENV.fetch('DEFAULT_ID_KEYCLOAK_PROVIDER', 'idporten'),
    'client_id' => ENV.fetch('DEFAULT_ID_KEYCLOAK_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_ID_KEYCLOAK_CLIENT_SECRET', 'fake secret'),
    'issuer' => ENV.fetch('DEFAULT_ID_KEYCLOAK_ISSUER', 'fake issuer'),
    'enabled_for_verified_actions' => true
  },
  'twoday' => {
    'name' => 'twoday',
    'client_id' => ENV.fetch('DEFAULT_ID_TWODAY_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_ID_TWODAY_CLIENT_SECRET', 'fake secret'),
    'domain' => ENV.fetch('DEFAULT_ID_TWODAY_DOMAIN', 'fake domain'),
    'ui_method_name' => 'Bank ID',
    'enabled_for_verified_actions' => true
  },
  'acm' => {
    'name' => 'acm',
    'client_id' => ENV.fetch('DEFAULT_ID_ACM_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_ID_ACM_CLIENT_SECRET', 'fake secret'),
    'domain' => ENV.fetch('DEFAULT_ID_ACM_DOMAIN', 'fake domain'),
    'rrn_api_key' => ENV.fetch('DEFAULT_ID_ACM_RRN_API_KEY', 'fake key'),
    'rrn_environment' => 'dv',
    'ui_method_name' => 'ACM',
    'enabled_for_verified_actions' => true
  },

  # Verification-only methods (cannot be used for login/SSO).
  'cow' => {
    'name' => 'cow',
    'api_username' => 'fake_username',
    'api_password' => 'fake_password',
    'rut_empresa' => 'fake_rut_empresa'
  },
  'bogus' => {
    'name' => 'bogus'
  },
  'id_card_lookup' => {
    'name' => 'id_card_lookup',
    'ui_method_name' => 'Enter social security number',
    'card_id' => 'Social security number',
    'card_id_placeholder' => 'xx-xxxxx-xx',
    'card_id_tooltip' => 'You can find this number on you ID card. We check your number without storing it.',
    'explainer_image_url' => 'http://localhost:4000/id_card_explainer.jpg'
  },

  # Login-only SSO methods (cannot be used for identity verification).
  'hoplr' => {
    'name' => 'hoplr',
    'environment' => 'test',
    'client_id' => ENV.fetch('DEFAULT_HOPLR_CLIENT_ID', 'fake id'),
    'client_secret' => ENV.fetch('DEFAULT_HOPLR_CLIENT_SECRET', 'fake secret')
  },
  'vienna_citizen' => {
    'name' => 'vienna_citizen',
    'environment' => 'test'
  },
  'vienna_employee' => {
    'name' => 'vienna_employee',
    'environment' => 'test'
  }
}.freeze

# Create (or recreate) the verified-actions test data used to test the Fake SSO verification flow.
def setup_verified_actions_test_data
  # Remove the existing project + group
  Project.find_by(slug: 'verified-actions-project-test')&.destroy!
  Group.find_by(slug: 'verified-actions-group-test')&.destroy!

  project = Project.create!(
    title_multiloc: { en: 'Verified actions test project' },
    description_multiloc: { en: 'This project has verified actions enabled' },
    slug: 'verified-actions-project-test'
  )
  phase = project.phases.create!(
    title_multiloc: { en: 'Verified actions test phase' },
    description_multiloc: { en: 'This phase has verified actions enabled' },
    start_at: Time.now - 1.day,
    participation_method: 'ideation'
  )
  phase.ideas.create!(
    title_multiloc: { en: 'Verified actions test idea' },
    body_multiloc: { en: 'This idea needs to be verified to react to it' },
    slug: 'verified-actions-idea-test',
    project: project
  )

  # Add in the permissions
  Permissions::PermissionsUpdateService.new.update_permissions_for_scope(phase)

  # No fields for reacting_idea
  permission = phase.reload.permissions.where(action: 'reacting_idea').first
  permission.update!(permitted_by: 'verified', global_custom_fields: false)

  # Politician field for posting_idea (other fields are locked to verification)
  permission = phase.reload.permissions.where(action: 'posting_idea').first
  permission.update!(permitted_by: 'verified', global_custom_fields: false)
  PermissionsCustomField.create!(permission: permission, custom_field: CustomField.find_by(key: 'politician'), required: true)

  # Domicile field and verification by group for commenting_idea
  permission = phase.reload.permissions.where(action: 'commenting_idea').first
  permission.update!(global_custom_fields: false)
  PermissionsCustomField.create!(permission: permission, custom_field: CustomField.find_by(key: 'domicile'), required: true)

  group = Group.create!(title_multiloc: { en: 'Verified actions test group' }, slug: 'verified-actions-group-test', rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
  GroupsPermission.create!(group: group, permission: permission)
end

namespace :dev do
  desc 'Enable one or more comma-separated verification/SSO methods (or "all") on localhost, replacing any currently enabled methods (DEV ONLY)'
  task :enable_id_method, %i[method_names] => :environment do |_t, args|
    abort 'This task can only be run in the development environment.' unless Rails.env.development?

    tenant = Tenant.find_by(host: 'localhost')
    abort 'No localhost tenant found.' unless tenant

    # Rake splits `[a,b,c]` into separate positional args, so collect them all (args.to_a)
    # rather than a single named arg. We also split on comma to be safe.
    names = args.to_a.flat_map { |arg| arg.to_s.split(',') }.map(&:strip).reject(&:empty?)
    abort 'Please provide one or more method names, e.g. rake dev:enable_id_method[fake_sso,bogus] (or [all]).' if names.empty?

    names = DEV_ID_METHOD_CONFIGS.keys if names == ['all']

    unsupported = names - DEV_ID_METHOD_CONFIGS.keys
    if unsupported.any?
      puts "not supported: #{unsupported.join(', ')}"
      next
    end

    methods = names.map { |name| DEV_ID_METHOD_CONFIGS[name] }

    tenant.switch do
      settings = AppConfiguration.instance.settings
      settings['verification']['enabled'] = true
      settings['verification']['allowed'] = true
      settings['verification']['verification_methods'] = methods
      # Fake SSO has its own feature flag and ships with a ready-made verified-actions scenario.
      settings['fake_sso']['enabled'] = true if names.include?('fake_sso')
      AppConfiguration.instance.update!(settings: settings)

      setup_verified_actions_test_data if names.include?('fake_sso')

      puts "Enabled verification method(s): #{methods.map { |m| m['name'] }.join(', ')}"
    end
  end
end
