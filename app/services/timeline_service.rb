class TimelineService

  def active_phases project
    project.phases.where("(start_at < ?) AND (end_at > ?)", Time.now, Time.now)
  end

  def has_timeline project
    project.phases && (project.phases.count > 0)
  end

  def current_phase project
    if has_timeline project
      return active_phases(project)&.first || nil
    else
      return nil
    end
  end

end