# frozen_string_literal: true

class PulseCheckService
  RETURNING_USER_ABSENCE = 60.days
  # Copies from the template library and from other platforms are recorded the
  # same way, so both count as an external copy.
  PROJECT_IMPORT_ORIGINS = { 'project_copy' => 'external_copy', 'project' => 'import' }.freeze

  def enqueue(user, key, subject: nil, days_since_last_active: nil)
    return unless user

    user.with_lock do
      expire_pending(user)
      return unless PulseCheck.askable?(key, user)
      return if PulseCheck.cooling_down?(key, user)
      return if subject && PulseCheck.exists?(key: key, subject: subject)
      return if subject.nil? && user.pulse_checks.pending.exists?(key: key)

      user.pulse_checks.create!(key: key, subject: subject, days_since_last_active: days_since_last_active)
    end
  rescue ActiveRecord::RecordNotUnique
    nil
  end

  def after_project_create(project, user)
    admin_pub = project.admin_publication
    return unless admin_pub.published? || admin_pub.scheduled_for_publication?

    enqueue(user, 'project_setup_ease', subject: project)
  end

  def after_project_update(project, user)
    admin_pub = project.admin_publication
    just_published = admin_pub.saved_change_to_first_published_at? &&
                     admin_pub.scheduled_status_before_last_save != 'published'
    just_scheduled = admin_pub.saved_change_to_scheduled_status? &&
                     admin_pub.scheduled_for_publication? &&
                     admin_pub.first_published_at.nil?
    return unless just_published || just_scheduled

    enqueue(user, 'project_setup_ease', subject: project)
  end

  def after_session_start(user, last_active_at_was)
    return if last_active_at_was.nil? || last_active_at_was > RETURNING_USER_ABSENCE.ago

    days = (Time.zone.now.to_date - last_active_at_was.to_date).to_i
    enqueue(user, 'return_findability', days_since_last_active: days)
  end

  def show_next(user, trigger:, ui_version:, admin_area: nil, project_id: nil)
    # This runs after every save in the project back office, and usually
    # nothing is pending. Checking first avoids locking the user row each time.
    return unless user.pulse_checks.pending.exists?

    user.with_lock do
      expire_pending(user)
      pulse_check = user.pulse_checks.pending.order(:created_at).find do |p|
        PulseCheck.shown_on?(p.key, trigger, admin_area) &&
          p.matches_project?(project_id) &&
          PulseCheck.askable?(p.key, user) &&
          !PulseCheck.cooling_down?(p.key, user)
      end
      return unless pulse_check

      pulse_check.update!(
        status: 'shown',
        shown_at: Time.zone.now,
        previously_shown_count: user.pulse_checks.displayed.count,
        trigger: trigger,
        admin_area: admin_area,
        ui_version: ui_version,
        staff: user.govocal_or_citizenlab_email?,
        role: user.highest_role.to_s,
        locale: user.locale,
        project_origin: (project_origin(pulse_check.subject) if pulse_check.subject.is_a?(Project))
      )
      pulse_check
    end
  end

  private

  def expire_pending(user)
    return unless user.pulse_checks.pending.exists?

    PulseCheck::CHECKS.each do |key, definition|
      pulse_checks = user.pulse_checks.pending.where(key: key)
      pulse_checks.where(created_at: ...definition[:expires_after].ago).update_all(status: 'expired')
      pulse_checks.where(subject_id: nil).update_all(status: 'expired') if definition[:subject_type] == 'Project'
    end
  end

  def project_origin(project)
    return 'local_copy' if Activity.exists?(item: project, action: 'local_copy_created')

    PROJECT_IMPORT_ORIGINS.fetch(project.project_import&.import_type, 'blank')
  end
end
