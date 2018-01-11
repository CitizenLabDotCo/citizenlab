class ParticipationContextService

  POSTING_DISABLED_REASONS = {
    no_active_context: 'no_active_context',
    not_ideation: 'not_ideation',
    posting_disabled: 'posting_disabled'
  }

  COMMENTING_DISABLED_REASONS = {
    no_active_context: 'no_active_context',
    commenting_disabled: 'commenting_disabled'
  }

  VOTING_DISABLED_REASONS = {
    no_active_context: 'no_active_context',
    voting_disabled: 'voting_disabled',
    voting_limited_max_reached: 'voting_limited_max_reached'
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

  def posting_disabled_reason project
    context = get_participation_context(project)
    if !context
      POSTING_DISABLED_REASONS[:no_active_context]
    elsif !context.ideation?
      POSTING_DISABLED_REASONS[:not_ideation]
    elsif !context.posting_enabled
      POSTING_DISABLED_REASONS[:posting_disabled]
    else
      nil
    end
  end

  def commenting_disabled_reason project
    context = get_participation_context(project)
    if !context
      COMMENTING_DISABLED_REASONS[:no_active_context]
    elsif !context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    else
      nil
    end
  end

  def voting_disabled_reason project, user=nil
    context = get_participation_context(project)
    if !context
      VOTING_DISABLED_REASONS[:no_active_context]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    elsif user && context.voting_limited? && votes_in_context(context, user) >= context.voting_limited_max
      VOTING_DISABLED_REASONS[:voting_limited_max_reached]
    else
      nil
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
      start_at = context.respond_to?(:start_at) ? context.start_at : nil
      end_at = context.respond_to?(:end_at) ? context.end_at : nil
      votes = context.votes.where(user: user)

      votes = votes.where("created_at > ?", start_at) if start_at
      votes = votes.where("created_at < ?", end_at) if end_at

      votes.count
    end

end