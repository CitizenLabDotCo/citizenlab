class ProjectSortingService

  def sort projects_scope
    if Tenant.current.has_feature? 'manual_project_sorting'
      order_by_publication_status(projects_scope)
        .ordered
    else
      projects_scope
        .joins(:project_sort_score)
        .order(Arel.sql('project_sort_scores.score'))
    end
  end

  def order_by_publication_status projects_scope
    # Triggering a subquery instead of building on the scope, in order to make
    # the order by play nicely with previous distinct operations
    Project
      .where(id: projects_scope)
      .distinct(false)
      .order(Arel.sql("CASE projects.publication_status WHEN 'draft' then 1 WHEN 'published' then 2 WHEN 'archived' THEN 3 ELSE 5 END"))
  end

  # Slow ruby implementation, to help nail down the spec and test SQL
  # implementation
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