# frozen_string_literal: true

class SideFxInitiativeService
  include SideFxHelper

  def initialize
    @automatic_assignment = false
  end

  def before_create(initiative, user)
    before_publish initiative, user if initiative.published?
  end

  def after_create(initiative, user)
    initiative.update!(body_multiloc: TextImageService.new.swap_data_images(initiative, :body_multiloc))
    return unless initiative.published?

    after_publish initiative, user
  end

  def before_update(initiative, user)
    initiative.body_multiloc = TextImageService.new.swap_data_images(initiative, :body_multiloc)
    return unless initiative.publication_status_change == %w[draft published]

    before_publish initiative, user
  end

  def after_update(initiative, user)
    if initiative.publication_status_previous_change == %w[draft published]
      after_publish initiative, user
    elsif initiative.published?
      LogActivityJob.perform_later(initiative, 'changed', user, initiative.updated_at.to_i)
    end

    if initiative.assignee_id_previously_changed?
      initiating_user = @automatic_assignment ? nil : user
      LogActivityJob.perform_later(initiative, 'changed_assignee', initiating_user, initiative.updated_at.to_i, payload: { change: initiative.assignee_id_previous_change })
    end

    if initiative.title_multiloc_previously_changed?
      LogActivityJob.perform_later(initiative, 'changed_title', user, initiative.updated_at.to_i, payload: { change: initiative.title_multiloc_previous_change })
    end

    return unless initiative.body_multiloc_previously_changed?

    LogActivityJob.perform_later(initiative, 'changed_body', user, initiative.updated_at.to_i, payload: { change: initiative.body_multiloc_previous_change })
  end

  def before_destroy(initiative, user); end

  def after_destroy(frozen_initiative, user)
    serialized_initiative = clean_time_attributes(frozen_initiative.attributes)
    serialized_initiative['location_point'] = serialized_initiative['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_initiative), 'deleted', user, Time.now.to_i, payload: { initiative: serialized_initiative })
  end

  private

  def before_publish(initiative, _user)
    set_assignee initiative
  end

  def after_publish(initiative, user)
    add_autovote initiative
    log_activity_jobs_after_published initiative, user
  end

  def set_assignee(initiative)
    default_assignee = User.active.admin.order(:created_at).reject(&:super_admin?).first
    return unless !initiative.assignee && default_assignee

    initiative.assignee = default_assignee
    @automatic_assignment = true
  end

  def add_autovote(initiative)
    initiative.votes.create!(mode: 'up', user: initiative.author)
    initiative.reload
  end

  def log_activity_jobs_after_published(initiative, user)
    LogActivityJob.set(wait: 20.seconds).perform_later(initiative, 'published', user, initiative.published_at.to_i)
    return unless first_user_initiative? initiative, user

    LogActivityJob.set(wait: 20.seconds).perform_later(initiative, 'first_published_by_user', user, initiative.published_at.to_i)
  end

  def first_user_initiative?(initiative, user)
    (user.initiatives.size == 1) && (user.initiatives.first.id == initiative.id)
  end
end

SideFxInitiativeService.prepend(FlagInappropriateContent::Patches::SideFxInitiativeService)
