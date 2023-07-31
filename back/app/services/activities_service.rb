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
    create_phase_ended_activities now
  end

  private

  def create_phase_started_activities(now, last_time)
    return unless now.to_date != last_time.to_date

    Phase.published.starting_on(now.to_date).each do |phase|
      if phase.ends_before?(now + 1.day)
        raise "Invalid phase started event would have been generated for phase\
               #{phase.id} with now=#{now} and last_time=#{last_time}"
      end

      LogActivityJob.perform_later(phase, 'started', nil, phase.start_at.to_time.to_i)
    end
  end

  def create_phase_upcoming_activities(now, last_time)
    return unless now.to_date != last_time.to_date

    Phase.published.starting_on(now.to_date + 1.week).each do |phase|
      if phase.ends_before?(now + 1.day)
        raise "Invalid phase upcoming event would have been generated for phase\
               #{phase.id} with now=#{now} and last_time=#{last_time}"
      end

      LogActivityJob.perform_later(phase, 'upcoming', nil, now.to_i)
    end
  end

  def create_invite_not_accepted_since_3_days_activities(now, last_time)
    Invite.where(accepted_at: nil)
      .where(created_at: (last_time - 3.days)..(now - 3.days)).each do |invite|
      LogActivityJob.perform_later(invite, 'not_accepted_since_3_days', nil, now.to_i)
    end
  end

  def create_phase_ending_soon_activities(now)
    if now.hour >= 8 && now.hour <= 20 # Only log activities during day time so they emails are more likely to be noticed
      Phase.published.where(end_at: now..now + 2.days).each do |phase|
        if Activity.find_by(item: phase, action: 'ending_soon').nil?
          LogActivityJob.perform_later(phase, 'ending_soon', nil, now.to_i)
        end
      end
    end
  end

  def create_basket_not_submitted_activities(now)
    Basket.not_submitted.each do |basket|
      if Activity.find_by(item: basket, action: 'not_submitted').nil? && basket.baskets_ideas.present? && basket.baskets_ideas.order(:updated_at).last.updated_at <= now - 1.day
        LogActivityJob.perform_later(basket, 'not_submitted', nil, now.to_i)
      end
    end
  end

  def create_phase_ended_activities(now)
    Phase.published.where(end_at: ..now).each do |phase|
      if Activity.find_by(item: phase, action: 'ended').nil?
        LogActivityJob.perform_later(phase, 'ended', nil, now.to_i)
      end
    end
  end
end
