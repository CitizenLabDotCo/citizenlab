class ParticipationContextService

  def initialize
    @memoized_votes_in_context = Hash.new{|hash,key| hash[key] = Hash.new}
  end

  def get_participation_context project
    if project.continuous?
      project
    elsif project.timeline?
      TimelineService.new.current_phase(project)
    end
  end

  def posting_disabled_reason project, user=nil
    context = get_participation_context(project)
    if !context
      'no_active_context'
    elsif !context.ideation?
      'not_ideation'
    elsif !context.posting_enabled
      'posting_disabled'
    else
      nil
    end
  end

  def commenting_disabled_reason project, user=nil
    context = get_participation_context(project)
    if !context
      'no_active_context'
    elsif !context.commenting_enabled
      'commenting_disabled'
    else
      nil
    end
  end

  def voting_disabled_reason project, user
    context = get_participation_context(project)
    if !context
      'no_active_context'
    elsif !context.voting_enabled
      'voting_disabled'
    elsif context.voting_limited? && votes_in_context(context, user) >= context.voting_limited_max
      'voting_limited_max_reached'
    else
      nil
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