# frozen_string_literal: true

# Should only be used in your local development environment
namespace :dev do
  desc 'Sets up localhost with fake SSO and a verified actions configured project for testing purposes (DEV ONLY)'
  task setup_fake_sso: :environment do |_t, _args|
    Tenant.find_by(host: 'localhost').switch do
      puts 'Setting up localhost'
      # Create the correct settings - switch off all SSO settings except for the fake SSO
      settings = AppConfiguration.instance.settings

      # Enable fake SSO
      settings['fake_sso']['enabled'] = true
      settings['verification']['verification_methods'] = [{ 'name' => 'fake_sso', 'method_name_multiloc' => {}, 'enabled_for_verified_actions' => true }]

      # Disable all other SSO methods
      # TODO
      AppConfiguration.instance.update!(settings: settings)

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
        participation_method: 'ideation',
        campaigns_settings: { project_phase_started: true }
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
  end
end
