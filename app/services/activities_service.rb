class ActivitiesService

  def create_periodic_activities_for_current_tenant since: (Time.now - 1.hour)
    create_phase_started_activities since 
  end


  private

  def create_phase_started_activities since
    Phase.where(start_at: since..Time.now).each do |phase|
      LogActivityJob.perform_later(phase, 'started', user, phase.started_at.to_i)
    end
  end

end