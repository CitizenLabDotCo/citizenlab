class TimelineService

  def future_phases project, time=Time.now
    date = time.to_date
    project.phases.select do |phase|
      phase.start_at > date
    end
  end

  def past_phases project, time=Time.now
    date = time.to_date
    project.phases.select do |phase|
      phase.end_at < date
    end
  end

  def current_phase project, time=Time.now
    date = time.to_date
    if project.timeline?
      project.phases.find do |phase|
        phase.start_at < date && phase.end_at >= date.to_date
      end
    end
  end

  def is_in_active_phase? idea
    idea.phases.include?(current_phase(idea.project))
  end

  def overlaps? phase1, phase2
    !((phase1.end_at.to_date < phase2.start_at.to_date) || (phase2.end_at.to_date < phase1.start_at.to_date)) 
  end

  def other_project_phases phase
    Phase.where(project_id: phase.project_id).all.select{|p| p.id != phase.id}
  end

end