# frozen_string_literal: true

class FeedbackPromptService
  RETURNING_USER_ABSENCE = 60.days

  def enqueue(user, key, subject: nil, days_since_last_active: nil)
    return unless FeedbackPrompt.askable?(key, user)
    return if FeedbackPrompt.cooling_down?(key, user)
    return if subject && FeedbackPrompt.exists?(key: key, subject: subject)
    return if subject.nil? && user.feedback_prompts.pending.where(key: key).any? { |prompt| !prompt.expired? }

    user.feedback_prompts.create!(key: key, subject: subject, days_since_last_active: days_since_last_active)
  rescue ActiveRecord::RecordNotUnique
    nil
  end

  def after_project_create(project, user)
    admin_pub = project.admin_publication
    return unless admin_pub.published? || admin_pub.scheduled_status == 'published'

    enqueue(user, 'project_setup_ease', subject: project)
  end

  def after_project_update(project, user)
    admin_pub = project.admin_publication
    just_published = admin_pub.saved_change_to_first_published_at? &&
                     admin_pub.scheduled_status_before_last_save != 'published'
    just_scheduled = admin_pub.saved_change_to_scheduled_status? &&
                     admin_pub.scheduled_status == 'published' &&
                     admin_pub.first_published_at.nil?
    return unless just_published || just_scheduled

    enqueue(user, 'project_setup_ease', subject: project)
  end

  def after_session_start(user, last_active_at_was)
    return if last_active_at_was.nil? || last_active_at_was > RETURNING_USER_ABSENCE.ago

    days = (Time.zone.now.to_date - last_active_at_was.to_date).to_i
    enqueue(user, 'return_findability', days_since_last_active: days)
  end

  def show_next(user, trigger:, ui_version:, admin_area: nil)
    prompt = user.feedback_prompts.pending.order(:created_at).find do |p|
      !p.expired? &&
        FeedbackPrompt.shown_on?(p.key, trigger, admin_area) &&
        FeedbackPrompt.askable?(p.key, user) &&
        !FeedbackPrompt.cooling_down?(p.key, user)
    end
    return unless prompt

    prompt.update!(
      status: 'shown',
      shown_at: Time.zone.now,
      previously_shown_count: user.feedback_prompts.displayed.count,
      trigger: trigger,
      admin_area: admin_area,
      ui_version: ui_version,
      staff: user.govocal_or_citizenlab_email?,
      role: user.highest_role.to_s,
      locale: user.locale,
      project_origin: (project_origin(prompt.subject) if prompt.subject.is_a?(Project))
    )
    prompt
  end

  private

  def project_origin(project)
    if Activity.exists?(item: project, action: 'local_copy_created')
      'copy'
    elsif project.project_import&.import_type == 'project_copy'
      # Projects created from the template library are imported through the same path.
      'template'
    else
      'blank'
    end
  end
end
