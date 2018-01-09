class TimelineService

  def active_phases project
    project.phases.where("(start_at < NOW()) AND (end_at > NOW())")
  end

  def has_timeline project
    project.timeline?
  end

  def current_phase project
    if project.timeline?
      return active_phases(project)&.first
    end
  end

end