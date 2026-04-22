# frozen_string_literal: true

class ActivitiesService
  def create_periodic_activities(now: Time.current, since: 1.hour)
    now = AppConfiguration.timezone.at(now)
    last_time = now - since

    create_phase_started_activities now, last_time
    create_phase_upcoming_activities now, last_time
    create_invite_not_accepted_since_3_days_activities now, last_time
    create_phase_ending_soon_activities now
    create_basket_not_submitted_activities now
    create_survey_not_submitted_activities now
    create_phase_ended_activities now
  end

  private

  def create_phase_started_activities(now, _last_time)
    # Selects more phases than strictly necessary to make it more defensive and help
    # recover if previous jobs failed.
    starting_phases = Phase.published.where(start_at: (now - 1.day)..now)

    # Phases with a started activity in the last 24 hours are excluded to avoid creating
    # duplicate activities (and consequently, duplicate notifications). We still allow
    # multiple started activities on different days to account for modifications to the
    # `start_at` of a phase.
    excluded_phases = Activity
      .where(item_id: starting_phases, action: 'started', acted_at: (now - 1.day)..)
      .select(:item_id)

    starting_phases.where.not(id: excluded_phases).each do |phase|
      LogActivityJob.perform_later(phase, 'started', nil, phase.start_at)
    end
  end

  def create_phase_upcoming_activities(now, _last_time)
    upcoming_phases = Phase.published.where(start_at: now..(now + 1.week))

    # Exclude phases for which an upcoming activity has already been created to avoid
    # duplicate notifications.
    excluded_phases = Activity
      .where(item_id: upcoming_phases, action: 'upcoming')
      .select(:item_id)

    upcoming_phases.where.not(id: excluded_phases).each do |phase|
      if phase.ends_before?(now + 1.day)
        ErrorReporter.report_msg(
          'Invalid phase upcoming event would have been generated',
          extra: { phase_id: phase.id, now: now, end_at: phase.end_at }
        )

        next
      end

      LogActivityJob.perform_later(phase, 'upcoming', nil, now)
    end
  end

  def create_invite_not_accepted_since_3_days_activities(now, last_time)
    Invite.where(accepted_at: nil)
      .where(created_at: (last_time - 3.days)..(now - 3.days)).each do |invite|
      LogActivityJob.perform_later(invite, 'not_accepted_since_3_days', nil, now)
    end
  end

  def create_phase_ending_soon_activities(now)
    # Only log activities during daytime, so email notifications are more likely to be noticed.
    return unless now.hour >= 8 && now.hour <= 20

    ending_soon_phases = Phase.published.where(end_at: now..(now + 2.days))

    excluded_phases = Activity
      .where(item_id: ending_soon_phases, action: 'ending_soon')
      .select(:item_id)

    ending_soon_phases.where.not(id: excluded_phases).each do |phase|
      LogActivityJob.perform_later(phase, 'ending_soon', nil, now)
    end
  end

  def create_basket_not_submitted_activities(now)
    baskets = Basket.not_submitted.includes(:phase, :baskets_ideas)

    excluded_baskets = Activity
      .where(item_id: baskets, action: 'not_submitted')
      .select(:item_id)

    baskets.where.not(id: excluded_baskets).each do |basket|
      next if basket.baskets_ideas.blank?
      next if basket.baskets_ideas.max_by(&:updated_at).updated_at > now - 1.day
      next if basket.phase.ends_before?(now)

      LogActivityJob.perform_later(basket, 'not_submitted', nil, now)
    end
  end

  def create_survey_not_submitted_activities(now)
    draft_surveys = Idea.draft_surveys.includes(:creation_phase)

    excluded_ideas = Activity
      .where(item_id: draft_surveys, action: 'survey_not_submitted')
      .select(:item_id)

    draft_surveys.where.not(id: excluded_ideas).each do |idea|
      next if idea.updated_at > now - 1.day
      next if idea.creation_phase.ends_before?(now)
      # Is there survey already submitted by the same author in the same phase?
      next if Idea.exists?(author_id: idea.author_id, creation_phase: idea.creation_phase, publication_status: 'published')

      LogActivityJob.perform_later(idea, 'survey_not_submitted', nil, now)
    end
  end

  def create_phase_ended_activities(now)
    ended_phases = Phase.published.where(end_at: ..now)

    excluded_phases = Activity
      .where(item_id: ended_phases, action: 'ended')
      .select(:item_id)

    ended_phases.where.not(id: excluded_phases).each do |phase|
      LogActivityJob.perform_later(phase, 'ended', nil, now)
    end
  end
end
