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

  def after_update(initiative, user, old_cosponsors_ids)
    log_activities_if_cosponsors_added(initiative, user, old_cosponsors_ids)
    transition_to_review_pending_if_required(initiative, user)
    remove_user_from_past_activities_with_item(initiative, user) if initiative.anonymous_previously_changed?(to: true)

    if initiative.publication_status_previous_change == %w[draft published]
      after_publish initiative, user
    elsif initiative.published?
      LogActivityJob.perform_later(initiative, 'changed', user_for_activity_on_anonymizable_item(initiative, user), initiative.updated_at.to_i)
    end

    if initiative.assignee_id_previously_changed?
      initiating_user = @automatic_assignment ? nil : user
      LogActivityJob.perform_later(initiative, 'changed_assignee', user_for_activity_on_anonymizable_item(initiative, initiating_user), initiative.updated_at.to_i, payload: { change: initiative.assignee_id_previous_change })
    end

    if initiative.title_multiloc_previously_changed?
      LogActivityJob.perform_later(initiative, 'changed_title', user_for_activity_on_anonymizable_item(initiative, user), initiative.updated_at.to_i, payload: { change: initiative.title_multiloc_previous_change })
    end

    return unless initiative.body_multiloc_previously_changed?

    LogActivityJob.perform_later(initiative, 'changed_body', user_for_activity_on_anonymizable_item(initiative, user), initiative.updated_at.to_i, payload: { change: initiative.body_multiloc_previous_change })
  end

  def after_accept_cosponsorship_invite(cosponsors_initiative, user)
    LogActivityJob.perform_later(
      cosponsors_initiative,
      'cosponsorship_accepted',
      user, # We don't want anonymized users being cosponsors
      cosponsors_initiative.updated_at.to_i,
      payload: { change: cosponsors_initiative.status_previous_change }
    )
  end

  def before_destroy(initiative, user); end

  def after_destroy(frozen_initiative, user)
    serialized_initiative = clean_time_attributes(frozen_initiative.attributes)
    serialized_initiative['location_point'] = serialized_initiative['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_initiative), 'deleted', user, Time.now.to_i, payload: { initiative: serialized_initiative })
  end

  private

  def log_activities_if_cosponsors_added(initiative, user, old_cosponsors_ids)
    added_ids = initiative.cosponsors.map(&:id) - old_cosponsors_ids

    if added_ids.present?
      new_cosponsors_initiatives = initiative.cosponsors_initiatives.where(user_id: added_ids)

      new_cosponsors_initiatives.each do |cosponsors_initiative|
        LogActivityJob.perform_later(
          cosponsors_initiative,
          'created',
          user, # We don't want anonymized authors when cosponsors feature in use
          cosponsors_initiative.updated_at.to_i
        )
      end
    end
  end

  def transition_to_review_pending_if_required(initiative, user)
    if initiative.initiative_status&.code == 'changes_requested' && user == initiative.author
      status_id_to = InitiativeStatus.find_by(code: 'review_pending')&.id
      InitiativeStatusService.new.transition!([initiative.id], status_id_to)
    end
  end

  def before_publish(initiative, _user)
    set_assignee initiative
  end

  def after_publish(initiative, user)
    add_autoreaction initiative
    log_activity_jobs_after_published initiative, user
  end

  def set_assignee(initiative)
    default_assignee = User.active.admin.order(:created_at).reject(&:super_admin?).first
    return unless !initiative.assignee && default_assignee

    initiative.assignee = default_assignee
    @automatic_assignment = true
  end

  def add_autoreaction(initiative)
    initiative.reactions.create!(mode: 'up', user: initiative.author)
    initiative.reload
  end

  def log_activity_jobs_after_published(initiative, user)
    LogActivityJob.set(wait: 20.seconds).perform_later(initiative, 'published', user_for_activity_on_anonymizable_item(initiative, user), initiative.published_at.to_i)
  end
end

SideFxInitiativeService.prepend(FlagInappropriateContent::Patches::SideFxInitiativeService)
