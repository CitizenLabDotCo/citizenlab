class ParticipationContextService

  POSTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    posting_disabled: 'posting_disabled',
    not_permitted: 'not_permitted'
  }

  COMMENTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_supported: 'not_supported',
    idea_not_in_current_phase: 'idea_not_in_current_phase',
    commenting_disabled: 'commenting_disabled',
    not_permitted: 'not_permitted'
  }

  VOTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    voting_disabled: 'voting_disabled',
    not_permitted: 'not_permitted',
    voting_limited_max_reached: 'voting_limited_max_reached',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }

  BUDGETING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_permitted: 'not_permitted',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }

  TAKING_SURVEY_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_permitted: 'not_permitted',
    not_survey: 'not_survey'
  }


  def initialize
    @memoized_votes_in_context = Hash.new{|hash,key| hash[key] = Hash.new}
    @timeline_service = TimelineService.new
  end

  def get_participation_context project
    if project.archived?
      nil
    elsif project.continuous?
      project
    elsif project.timeline?
      @timeline_service.current_phase project
    end
  end

  def in_current_context? idea, current_context=nil
    project = idea.project
    current_context ||= get_participation_context project
    if project.continuous?
      true
    else
      idea.ideas_phases.find{|ip| ip.phase_id == current_context.id }
    end
  end

  def participation_possible_for_context? context, user
    !( posting_disabled_reason_for_context(context, user)\
    && commenting_disabled_reason_for_context(context, user)\
    && voting_disabled_reason_for_context(context, user)\
    && taking_survey_disabled_reason_for_context(context, user)\
    && budgeting_disabled_reason_for_context(context, user) )
  end

  def posting_disabled_reason_for_project project, user
    context = project && get_participation_context(project)
    posting_disabled_reason_for_context context, user
  end

  def posting_disabled_reason_for_context context, user
    if !context
      POSTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      POSTING_DISABLED_REASONS[:not_ideation]
    elsif !context.posting_enabled
      POSTING_DISABLED_REASONS[:posting_disabled]
    elsif !context_permission(context, 'posting')&.granted_to?(user)
      POSTING_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def commenting_disabled_reason_for_idea idea, user
    active_context = get_participation_context idea.project
    if !active_context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !in_current_context? idea, active_context
      COMMENTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      commenting_disabled_reason_for_project(idea.project, user)
    end
  end

  def commenting_disabled_reason_for_project project, user
    context = get_participation_context project
    commenting_disabled_reason_for_context context, user
  end

  def commenting_disabled_reason_for_context context, user
    if !context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !context.can_contain_ideas?
      COMMENTING_DISABLED_REASONS[:not_supported]
    elsif !context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    elsif !context_permission(context, 'commenting')&.granted_to?(user)
      COMMENTING_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def voting_disabled_reason_for_comment comment, user
    case comment.post_type
    when 'Idea'
      commenting_disabled_reason_for_idea comment.post, user
    when 'Initiative'
      voting_disabled_reason_for_initiative comment.post, user
    else
      raise "No support for post type #{comment.post_type}"
    end
  end

  def voting_disabled_reason_for_idea idea, user
    context = get_participation_context idea.project
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !in_current_context? idea, context
      VOTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      voting_disabled_reason_for_project(idea.project, user)
    end
  end

  def voting_disabled_reason_for_initiative initiative, user
    nil
  end

  def voting_disabled_reason_for_project project, user
    context = get_participation_context project
    voting_disabled_reason_for_context context, user
  end

  def voting_disabled_reason_for_context context, user
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      VOTING_DISABLED_REASONS[:not_ideation]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    elsif !context_permission(context, 'voting')&.granted_to?(user)
      VOTING_DISABLED_REASONS[:not_permitted]
    elsif (
      user && 
      context.voting_limited? && 
      votes_in_context(context, user) >= context.voting_limited_max
      )
      VOTING_DISABLED_REASONS[:voting_limited_max_reached]
    else
      nil
    end
  end

  def cancelling_votes_disabled_reason_for_idea idea, user
    context = get_participation_context idea.project
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      VOTING_DISABLED_REASONS[:not_ideation]
    elsif !in_current_context? idea, context
      VOTING_DISABLED_REASONS[:idea_not_in_current_phase]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    elsif !context_permission(context, 'voting')&.granted_to?(user)
      VOTING_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def taking_survey_disabled_reason_for_project project, user
    context = get_participation_context project
    taking_survey_disabled_reason_for_context context, user
  end

  def taking_survey_disabled_reason_for_context context, user
    if !context
      TAKING_SURVEY_DISABLED_REASONS[:project_inactive]
    elsif !context.survey?
      TAKING_SURVEY_DISABLED_REASONS[:not_survey]
    elsif !context_permission(context, 'taking_survey')&.granted_to?(user)
      TAKING_SURVEY_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def budgeting_disabled_reason_for_idea idea, user
    context = get_participation_context idea.project
    if context && !in_current_context?(idea, context)
      BUDGETING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      budgeting_disabled_reason_for_context context, user
    end
  end

  def budgeting_disabled_reason_for_context context, user
    if !context
      BUDGETING_DISABLED_REASONS[:project_inactive]
    elsif !context_permission(context, 'budgeting')&.granted_to?(user)
      BUDGETING_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def future_posting_enabled_phase project, user, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.posting_enabled && context_permission(phase, 'posting')&.granted_to?(user)
    end
  end

  def future_commenting_enabled_phase project, user, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.can_contain_ideas? && phase.commenting_enabled && context_permission(phase, 'commenting')&.granted_to?(user)
    end
  end

  def future_voting_enabled_phase project, user, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.can_contain_ideas? && phase.voting_enabled && context_permission(phase, 'voting')&.granted_to?(user)
    end
  end

  def future_comment_voting_enabled_phase project, user, time=Time.now
    future_commenting_enabled_phase project, user, time
  end

  def future_budgeting_enabled_phase project, user, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      context_permission(phase, 'budgeting')&.granted_to?(user)
    end
  end

  def moderating_participation_context_ids user
    project_ids = user.moderatable_project_ids
    phase_ids = Phase.where(project_id: project_ids).pluck(:id)
    project_ids + phase_ids
  end

  def allocated_budget project
    Idea.from(project.ideas.select('budget * baskets_count as allocated_budget')).sum(:allocated_budget)
  end

  def allocated_budgets projects
    Idea.from(Idea.where(project: projects).select('project_id, budget * baskets_count as allocated_budget')).group(:project_id).sum(:allocated_budget)
  end


  private

  def votes_in_context context, user
    @memoized_votes_in_context[context.id][user.id] ||= calculate_votes_in_context(context, user)
  end

  def calculate_votes_in_context context, user
    user.votes.where(votable_id: context.ideas).count
  end

  def context_permission context, action
    # We use ruby #find instead of SQL to have a higher chance of hitting
    # ActiveRecord's query cache, since this can be repeated a lot for the
    # same context.
    context.permissions.find{|permission| permission.action == action}
  end

end