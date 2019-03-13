class ActivitiesService

  def create_periodic_activities_for_current_tenant since: (Time.now - 1.hour)
    create_phase_started_activities since 
    create_phase_upcoming_activities since
  end


  private

  def create_phase_started_activities since
    Phase.where(start_at: since..Time.now).each do |phase|
      LogActivityJob.perform_later(phase, 'started', nil, phase.start_at.to_time.to_i)
    end
  end

  def create_phase_upcoming_activities since
    Phase.where(start_at: (since + 1.week)..(Time.now + 1.week)).each do |phase|
      LogActivityJob.perform_later(phase, 'upcoming', nil, phase.start_at.to_time.to_i)
    end
  end

end