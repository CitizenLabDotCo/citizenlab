class ParticipationContextService

  POSTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    posting_disabled: 'posting_disabled',
    not_permitted: 'not_permitted'
  }

  COMMENTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    commenting_disabled: 'commenting_disabled',
    not_permitted: 'not_permitted'
  }

  VOTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    voting_disabled: 'voting_disabled',
    not_permitted: 'not_permitted',
    voting_limited_max_reached: 'voting_limited_max_reached',
    not_in_active_context: 'not_in_active_context'
  }

  def initialize
    @memoized_votes_in_context = Hash.new{|hash,key| hash[key] = Hash.new}
    @timeline_service = TimelineService.new
  end

  def get_participation_context project
    if project.continuous?
      project
    elsif project.timeline?
      @timeline_service.current_phase project
    end
  end

  def get_last_active_participation_context idea
    project = idea.project
    if project.continuous?
      project
    elsif project.timeline?
      idea.phases.sort_by(&:end_at).last
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

  def posting_disabled_reason project, user
    context = project && get_participation_context(project)
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

  def commenting_disabled_reason idea, user
    context = get_participation_context idea.project
    last_context = get_last_active_participation_context idea
    if !context || !last_context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    elsif !context_permission(context, 'commenting')&.granted_to?(user)
      COMMENTING_DISABLED_REASONS[:not_permitted]
    elsif !last_context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    elsif !context_permission(last_context, 'commenting')&.granted_to?(user)
      COMMENTING_DISABLED_REASONS[:not_permitted]
    else
      nil
    end
  end

  def voting_disabled_reason idea, user
    context = get_participation_context idea.project
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !in_current_context? idea, context
      VOTING_DISABLED_REASONS[:not_in_active_context]
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

  def cancelling_votes_disabled_reason idea, user
    context = get_participation_context idea.project
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !in_current_context? idea, context
      VOTING_DISABLED_REASONS[:not_in_active_context]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    elsif !context_permission(context, 'voting')&.granted_to?(user)
      VOTING_DISABLED_REASONS[:not_permitted]
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
      phase.commenting_enabled && context_permission(phase, 'commenting')&.granted_to?(user)
    end
  end

  def future_voting_enabled_phase project, user, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.voting_enabled && context_permission(phase, 'voting')&.granted_to?(user)
    end
  end

  def moderating_participation_context_ids user
    project_ids = user.moderatable_project_ids
    phase_ids = Phase.where(project_id: project_ids).pluck(:id)
    project_ids + phase_ids
  end


  private

  def votes_in_context context, user
    @memoized_votes_in_context[context.id][user.id] ||= calculate_votes_in_context(context, user)
  end

  def calculate_votes_in_context context, user
    user.votes.where(votable_id: context.ideas).count
  end

  def context_permission context, action
    context.permissions.where(action: action).first
  end

end