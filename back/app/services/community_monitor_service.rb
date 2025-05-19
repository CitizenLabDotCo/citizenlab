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

    @project ||= Project.find(project_id)
  end

  def phase
    return nil unless enabled? && project_id

    @phase ||= Phase.find_by(project_id: project_id)
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
    project ||= Project.find_by(internal_role: 'community_monitor', hidden: true)
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

  def find_or_create_previous_quarter_report
    return nil unless enabled? && project_id

    start_date, end_date = previous_quarter_range
    year, quarter = previous_quarter(start_date)

    # Return existing report if it exists
    existing_report = ReportBuilder::Report.find_by(
      phase: phase,
      year: year,
      quarter: quarter
    )
    return existing_report if existing_report

    # Do not create a report if there are no responses for the previous quarter
    responses = phase.ideas.where(published_at: start_date..end_date)
    return nil if responses.blank?

    # Create a new report for the previous quarter if one does not already exist
    ReportBuilder::Report.create!(
      name: "#{year}-#{quarter} #{I18n.t('email_campaigns.community_monitor_report.report_name')}",
      phase: phase,
      year: year,
      quarter: quarter
    )
  end

  private

  def settings
    AppConfiguration.instance.settings
  end

  def previous_quarter(date)
    year = date.year
    quarter = case date.month
    when 1..3 then 1
    when 4..6 then 2
    when 7..9 then 3
    when 10..12 then 4
    end
    [year, quarter]
  end

  def previous_quarter_range
    today = Time.zone.today
    previous_quarter_date = today << 3 # Subtract 3 months to get a date in the previous quarter

    # Determine the start and end months of the previous quarter
    start_month = (((previous_quarter_date.month - 1) / 3) * 3) + 1
    start_date = Date.new(previous_quarter_date.year, start_month, 1)
    end_date = (start_date >> 3) # Add 3 months for the start of the next quarter

    [start_date, end_date]
  end
end
