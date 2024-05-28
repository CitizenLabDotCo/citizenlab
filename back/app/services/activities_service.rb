# frozen_string_literal: true

class ActivitiesService
  def create_periodic_activities(now: Time.zone.now, since: 1.hour)
    now = Time.zone.at(now)
    now = now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))
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

  def create_phase_started_activities(now, last_time)
    return unless now.to_date != last_time.to_date

    start_date = now.to_date
    starting_phases = Phase.published.starting_on(start_date)

    # Phases that already have a started activity for *this starting date* are excluded
    # to avoid creating duplicate activities (and, consequently, duplicate
    # notifications). We still allow the creation of new activities when the start date
    # is different (which can occur if the phase is edited).
    excluded_phases = Activity
      .where(item_id: starting_phases, action: 'started', acted_at: start_date)
      .select(:item_id)

    starting_phases.where.not(id: excluded_phases).each do |phase|
      if phase.ends_before?(now + 1.day)
        raise "Invalid phase started event would have been generated for phase\
               #{phase.id} with now=#{now} and last_time=#{last_time}"
      end

      LogActivityJob.perform_later(phase, 'started', nil, start_date.to_time)
    end
  end

  def create_phase_upcoming_activities(now, last_time)
    today = now.to_date
    return unless today != last_time.to_date

    upcoming_phases = Phase.published.starting_on(today..(today + 1.week))
    # Exclude phases for which an upcoming activity has already been created to avoid
    # duplicate notifications.
    excluded_phases = Activity
      .where(item_id: upcoming_phases, action: 'upcoming')
      .select(:item_id)

    upcoming_phases.where.not(id: excluded_phases).each do |phase|
      if phase.ends_before?(now + 1.day)
        raise "Invalid phase upcoming event would have been generated for phase\
               #{phase.id} with now=#{now} and last_time=#{last_time}"
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
    if now.hour >= 8 && now.hour <= 20 # Only log activities during day time so they emails are more likely to be noticed
      Phase.published.where(end_at: now..now + 2.days).each do |phase|
        if Activity.find_by(item: phase, action: 'ending_soon').nil?
          LogActivityJob.perform_later(phase, 'ending_soon', nil, now)
        end
      end
    end
  end

  def create_basket_not_submitted_activities(now)
    Basket.not_submitted.each do |basket|
      next if Activity.find_by(item: basket, action: 'not_submitted')
      next if basket.baskets_ideas.blank?
      next if basket.baskets_ideas.order(:updated_at).last.updated_at > now - 1.day
      next if basket.phase.ends_before?(now)

      LogActivityJob.perform_later(basket, 'not_submitted', nil, now)
    end
  end

  def create_survey_not_submitted_activities(now)
    Idea.draft_surveys.each do |idea|
      next if Activity.find_by(item: idea, action: 'survey_not_submitted')
      next if idea.updated_at > now - 1.day
      next if idea.creation_phase.ends_before?(now)

      LogActivityJob.perform_later(idea, 'survey_not_submitted', nil, now)
    end
  end

  def create_phase_ended_activities(now)
    Phase.published.where(end_at: ..now).each do |phase|
      if Activity.find_by(item: phase, action: 'ended').nil?
        LogActivityJob.perform_later(phase, 'ended', nil, now)
      end
    end
  end
end
