class ActivitiesService

  def create_periodic_activities now: Time.now, since: 1.hour
    now = Time.at now
    now = now.in_time_zone(AppConfiguration.instance.settings('core', 'timezone'))
    last_time = now - since

    create_phase_started_activities now, last_time 
    create_phase_upcoming_activities now, last_time
    create_invite_not_accepted_since_3_days_activities now, last_time
  end


  private

  def create_phase_started_activities now, last_time
    if now.to_date != last_time.to_date
      Phase.where(start_at: now.to_date)
        .includes(project: [:admin_publication]).where(projects: {admin_publications: {publication_status: 'published'}}).each do |phase|
        if phase.end_at.iso8601 < (now+1.day).to_date.iso8601
          raise "Invalid phase started event would have been generated for phase #{phase.id} with now=#{now} and last_time=#{last_time}"
        end
        LogActivityJob.perform_later(phase, 'started', nil, phase.start_at.to_time.to_i)
      end
    end
  end

  def create_phase_upcoming_activities now, last_time
    if now.to_date != last_time.to_date
      Phase.where(start_at: now.to_date + 1.week)
        .includes(project: [:admin_publication]).where(projects: {admin_publications: {publication_status: 'published'}}).each do |phase|
        if phase.end_at.iso8601 < (now+1.day).to_date.iso8601
          raise "Invalid phase upcoming event would have been generated for phase #{phase.id} with now=#{now} and last_time=#{last_time}"
        end
        LogActivityJob.perform_later(phase, 'upcoming', nil, now.to_i)
      end
    end
  end

  def create_invite_not_accepted_since_3_days_activities now, last_time
    Invite.where('accepted_at IS NULL')
      .where(created_at: (last_time - 3.days)..(now - 3.days)).each do |invite|
      LogActivityJob.perform_later(invite, 'not_accepted_since_3_days', nil, now.to_i)
    end
  end

end