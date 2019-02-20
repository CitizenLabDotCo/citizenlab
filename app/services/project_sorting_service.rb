class ProjectSortingService

  def sort projects_scope
    if Tenant.current.has_feature? 'manual_project_sorting'
      projects_scope
        .publication_status_ordered
        .order(:ordering)
    else
      sort_projects_automatic(projects_scope)
    end
  end

  def sort_score project
    [
      calculate_status_score(project),
      calculate_active_score(project),
      calculate_hot_score(project),
      calculate_recency_score(project),
      calculate_action_score(project),
    ].join
  end

  private

  # Slow ruby implementation, to help nail down the spec
  def sort_projects_automatic projects_scope
    projects_scope.sort_by do |project|
      sort_score(project)
    end.tap do |projects|
      projects.each{|project| puts sort_score(project)}
    end

  end


  def calculate_status_score  project
    if project.draft? then 1
    elsif project.published? then 2
    elsif project.archived? then 3
    else 4
    end
  end

  def calculate_action_score project
    pcs = ParticipationContextService.new
    pc = pcs.get_participation_context project
    if !pc
      9
    elsif pc.ideation? && pc.posting_enabled
      1
    elsif pc.budgeting?
      2
    elsif pc.survey?
      3
    elsif pc.ideation? && pc.commenting_enabled
      4
    elsif pc.ideation? && pc.voting_enabled
      5
    elsif pc.ideation?
      6
    elsif pc.information?
      7
    else 
      8
    end
  end

  def calculate_active_score project
    pcs = ParticipationContextService.new
    pc = pcs.get_participation_context project
    if pc
      if project.timeline?
        1
      else
        2
      end
    else
      3
    end
  end

  def calculate_hot_score project, d=Date.today
    if project.timeline?
      phase_transitions = project.phases.flat_map{|ph| [ph.start_at, ph.end_at]}
      if phase_transitions.any?{|pt| (d-pt).abs <= 7}
        1
      else
        2
      end
    elsif project.continuous?
      if (d - project.created_at.to_date) <= 7
        1
      else
        2
      end
    end
  end

  def calculate_recency_score project, d=Date.today
    recency = if project.timeline?
      phase_transitions = project.phases.flat_map{|ph| [ph.start_at, ph.end_at]}
      phase_transitions.map{|pt| (d-pt).abs}.min || d - project.created_at.to_date
    elsif project.continuous?
      d - project.created_at.to_date
    end
    format("%05d", recency)
  end

end