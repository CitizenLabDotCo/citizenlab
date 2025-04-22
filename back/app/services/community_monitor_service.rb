# frozen_string_literal: true

class CommunityMonitorService
  def enabled?
    settings.dig('community_monitor', 'enabled') || false
  end

  def project_id
    return nil unless enabled?

    settings.dig('community_monitor', 'project_id')
  end

  def project
    return nil unless enabled? && project_id.present?

    Project.find(project_id)
  end

  def find_or_create_project(current_user)
    raise ActiveRecord::RecordNotFound unless enabled?

    project = project_id ? Project.find(project_id) : nil
    return project if project

    raise ActiveRecord::RecordNotFound unless current_user&.admin? # Only allow project to be created if an admin hits this endpoint

    create_and_set_project(project: project, current_user: current_user)
  end

  # Create the hidden project, phase & default form
  def create_and_set_project(project: nil, current_user: nil)
    # Also check if the project exists but has not been added to settings (eg when creating platform from template)
    project = project || Project.find_by(internal_role: 'community_monitor', hidden: true)
    unless project
      ActiveRecord::Base.transaction do
        multiloc_service = MultilocService.new
        project = Project.create!(
          hidden: true,
          slug: 'community-monitor',
          title_multiloc: multiloc_service.i18n_to_multiloc('phases.community_monitor_title'),
          internal_role: 'community_monitor'
        )

        SideFxProjectService.new.after_create(project, current_user) if project && current_user

        phase = Phase.create!(
          title_multiloc: multiloc_service.i18n_to_multiloc('phases.community_monitor_title'),
          project: project,
          participation_method: 'community_monitor_survey',
          submission_enabled: false,
          commenting_enabled: false,
          reacting_enabled: false,
          start_at: Time.now,
          campaigns_settings: { project_phase_started: true },
          native_survey_title_multiloc: multiloc_service.i18n_to_multiloc('phases.community_monitor_title'),
          native_survey_button_multiloc: multiloc_service.i18n_to_multiloc('phases.native_survey_button')
        )

        # Create an everyone permission by default
        Permission.create!(action: 'posting_idea', permission_scope: phase, permitted_by: 'everyone')

        # Persist the form
        phase.pmethod.create_default_form!
      end
    end

    # Set the ID in the settings
    settings['community_monitor']['project_id'] = project.id
    AppConfiguration.instance.update!(settings: settings)

    project
  end

  private

  def settings
    AppConfiguration.instance.settings
  end
end
