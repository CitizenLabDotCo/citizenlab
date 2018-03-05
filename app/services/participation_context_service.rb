class ParticipationContextService

  POSTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    posting_disabled: 'posting_disabled'
  }

  COMMENTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    commenting_disabled: 'commenting_disabled'
  }

  VOTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    voting_disabled: 'voting_disabled',
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
      @timeline_service.current_phase(project)
    end
  end

  def get_last_active_participation_context idea
    project = idea.project
    if project.continuous?
      project
    elsif project.timeline?
      idea.phases.last
    end
  end

  def in_current_context? idea, current_context=nil
    project = idea.project
    current_context ||= get_participation_context(project)
    if project.continuous?
      true
    else
      idea.ideas_phases.find{|ip| ip.phase_id == current_context.id }
    end
  end

  def posting_disabled_reason project
    context = get_participation_context(project)
    if !context
      POSTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      POSTING_DISABLED_REASONS[:not_ideation]
    elsif !context.posting_enabled
      POSTING_DISABLED_REASONS[:posting_disabled]
    else
      nil
    end
  end

  def commenting_disabled_reason idea
    project = idea.project
    current_context = get_participation_context(project)
    last_context = get_last_active_participation_context(idea)
    if !current_context || !last_context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !current_context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    elsif !last_context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    else
      nil
    end
  end

  def voting_disabled_reason idea, user=nil
    project = idea.project
    current_context = get_participation_context(project)
    if !current_context
      VOTING_DISABLED_REASONS[:project_inactive]
    else
      in_current_context = in_current_context?(idea, current_context)
      if !in_current_context
        VOTING_DISABLED_REASONS[:not_in_active_context]
      elsif !current_context.voting_enabled
        VOTING_DISABLED_REASONS[:voting_disabled]
      elsif (
        user && 
        current_context.voting_limited? && 
        votes_in_context(current_context, user) >= current_context.voting_limited_max
        )
        VOTING_DISABLED_REASONS[:voting_limited_max_reached]
      else
        nil
      end
    end
  end

  def cancelling_votes_disabled_reason idea, user=nil
    project = idea.project
    current_context = get_participation_context(project)
    if !current_context
      VOTING_DISABLED_REASONS[:project_inactive]
    else
      in_current_context = in_current_context?(idea, current_context)
      if !in_current_context
        VOTING_DISABLED_REASONS[:not_in_active_context]
      elsif !current_context.voting_enabled
        VOTING_DISABLED_REASONS[:voting_disabled]
      else
        nil
      end
    end
  end

  def future_posting_enabled_phase project, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.posting_enabled
    end
  end

  def future_commenting_enabled_phase project, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.commenting_enabled
    end
  end

  def future_voting_enabled_phase project, time=Time.now
    return nil if !project.timeline?
    @timeline_service.future_phases(project, time).find do |phase|
      phase.voting_enabled
    end
  end

  private

    def votes_in_context context, user
      @memoized_votes_in_context[context.id][user.id] ||= calculate_votes_in_context(context, user)
    end

    def calculate_votes_in_context context, user
      user.votes.where(votable_id: context.ideas).count
    end

end