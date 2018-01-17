class TimelineService

  def future_phases project, time=Time.now
    project.phases.select do |phase|
      phase.start_at > time
    end
  end

  def past_phases project, time=Time.now
    project.phases.select do |phase|
      phase.end_at < time
    end
  end

  def current_phase project, time=Time.now
    if project.timeline?
      project.phases.find do |phase|
        phase.start_at < time && phase.end_at > time
      end
    end
  end

  def is_in_active_phase? idea
    idea.phases.include?(current_phase(idea.project))
  end

end