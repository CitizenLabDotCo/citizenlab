# frozen_string_literal: true

class ParticipationContextService
  POSTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    posting_disabled: 'posting_disabled',
    posting_limited_max_reached: 'posting_limited_max_reached'
  }.freeze

  COMMENTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_supported: 'not_supported',
    idea_not_in_current_phase: 'idea_not_in_current_phase',
    commenting_disabled: 'commenting_disabled'
  }.freeze

  REACTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    reacting_disabled: 'reacting_disabled',
    reacting_dislike_disabled: 'reacting_dislike_disabled',
    reacting_like_limited_max_reached: 'reacting_like_limited_max_reached',
    reacting_dislike_limited_max_reached: 'reacting_dislike_limited_max_reached',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }.freeze

  VOTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_voting: 'not_voting',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }.freeze

  VOLUNTEERING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_volunteering: 'not_volunteering'
  }.freeze

  ANNOTATING_DOCUMENT_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_document_annotation: 'not_document_annotation'
  }.freeze

  TAKING_SURVEY_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_survey: 'not_survey'
  }.freeze

  TAKING_POLL_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_poll: 'not_poll',
    already_responded: 'already_responded'
  }.freeze

  def initialize
    @timeline_service = TimelineService.new
  end

  def get_participation_context(project)
    if project.admin_publication.archived?
      nil
    elsif project.continuous?
      project
    elsif project.timeline?
      @timeline_service.current_phase project
    end
  end

  def in_current_context?(idea, current_context = nil)
    project = idea.project
    current_context ||= get_participation_context project
    if project.continuous?
      true
    else
      idea.ideas_phases.find { |ip| ip.phase_id == current_context.id }
    end
  end

  def posting_idea_disabled_reason_for_project(project, user)
    context = project && get_participation_context(project)
    posting_idea_disabled_reason_for_context context, user
  end

  def posting_idea_disabled_reason_for_context(context, user)
    if !context
      POSTING_DISABLED_REASONS[:project_inactive]
    elsif !Factory.instance.participation_method_for(context).posting_allowed?
      POSTING_DISABLED_REASONS[:not_ideation] # TODO: (native surveys) change reason code?
    elsif !context.posting_enabled
      POSTING_DISABLED_REASONS[:posting_disabled]
    elsif user && posting_limit_reached?(context, user)
      POSTING_DISABLED_REASONS[:posting_limited_max_reached]
    else
      permission_denied_reason(user, 'posting_idea', context)
    end
  end

  def commenting_disabled_reason_for_idea(idea, user)
    active_context = get_participation_context idea.project
    if !active_context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !in_current_context? idea, active_context
      COMMENTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      commenting_idea_disabled_reason_for_project(idea.project, user)
    end
  end

  def commenting_idea_disabled_reason_for_project(project, user)
    context = get_participation_context project
    commenting_idea_disabled_reason_for_context context, user
  end

  def commenting_idea_disabled_reason_for_context(context, user)
    if !context
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !context.can_contain_ideas?
      COMMENTING_DISABLED_REASONS[:not_supported]
    elsif !context.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    else
      permission_denied_reason(user, 'commenting_idea', context)
    end
  end

  def reacting_disabled_reason_for_idea_comment(comment, user)
    commenting_disabled_reason_for_idea comment.post, user
  end

  def idea_reacting_disabled_reason_for(object, user, mode: nil)
    context = nil
    idea = nil
    case object.class.name
    when Reaction.name
      mode ||= object.mode
      idea = object.reactable
      context = get_participation_context idea.project
    when Idea.name
      idea = object
      context = get_participation_context idea.project
    when Project.name
      context = get_participation_context object
    when Phase.name
      # This allows checking for future or past
      # phases instead of the current context.
      context = object
    else
      ErrorReporter.report_msg("Unsupported context type #{object.class.name}")
      'unsupported_context_type'
    end

    # At some point, it may become more desirable
    # to either return multiple reasons or have
    # a predefined ranking of reasons to return
    # the reason with the highest rank.
    return REACTING_DISABLED_REASONS[:project_inactive] unless context

    reason = general_idea_reacting_disabled_reason(context, user)
    return reason if reason
    return REACTING_DISABLED_REASONS[:idea_not_in_current_phase] if idea && !in_current_context?(idea, context)

    if mode
      reason = mode_specific_idea_reacting_disabled_reason(mode, context, user)
      return reason if reason
    end

    permission_denied_reason user, 'reacting_idea', context
  end

  def cancelling_reacting_disabled_reason_for_idea(idea, user)
    context = get_participation_context idea.project
    if !context
      REACTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      REACTING_DISABLED_REASONS[:not_ideation]
    elsif !in_current_context? idea, context
      REACTING_DISABLED_REASONS[:idea_not_in_current_phase]
    elsif !context.reacting_enabled
      REACTING_DISABLED_REASONS[:reacting_disabled]
    else
      permission_denied_reason user, 'reacting_idea', get_participation_context(idea.project)
    end
  end

  def taking_survey_disabled_reason_for_project(project, user)
    context = get_participation_context project
    taking_survey_disabled_reason_for_context context, user
  end

  def taking_survey_disabled_reason_for_context(context, user)
    if !context
      TAKING_SURVEY_DISABLED_REASONS[:project_inactive]
    elsif !context.survey?
      TAKING_SURVEY_DISABLED_REASONS[:not_survey]
    else
      permission_denied_reason(user, 'taking_survey', context)
    end
  end

  def annotating_document_disabled_reason_for_project(project, user)
    context = get_participation_context project
    annotating_document_disabled_reason_for_context context, user
  end

  def annotating_document_disabled_reason_for_context(context, user)
    if !context
      ANNOTATING_DOCUMENT_DISABLED_REASONS[:project_inactive]
    elsif !context.document_annotation?
      ANNOTATING_DOCUMENT_DISABLED_REASONS[:not_document_annotation]
    else
      permission_denied_reason(user, 'annotating_document', context)
    end
  end

  def taking_poll_disabled_reason_for_project(project, user)
    context = get_participation_context project
    taking_poll_disabled_reason_for_context context, user
  end

  def taking_poll_disabled_reason_for_context(context, user)
    if !context
      TAKING_POLL_DISABLED_REASONS[:project_inactive]
    elsif !context.poll?
      TAKING_POLL_DISABLED_REASONS[:not_poll]
    elsif user && context.poll_responses.exists?(user: user)
      TAKING_POLL_DISABLED_REASONS[:already_responded]
    else
      permission_denied_reason(user, 'taking_poll', context)
    end
  end

  def voting_disabled_reason_for_project(project, user)
    context = get_participation_context project
    voting_disabled_reason_for_context context, user
  end

  def voting_disabled_reason_for_idea(idea, user)
    context = get_participation_context idea.project
    if context && !in_current_context?(idea, context)
      VOTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      voting_disabled_reason_for_context context, user
    end
  end

  def voting_disabled_reason_for_context(context, user)
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !context.voting?
      VOTING_DISABLED_REASONS[:not_voting]
    else
      permission_denied_reason(user, 'voting', context)
    end
  end

  def volunteering_disabled_reason_for_project(project, user)
    context = get_participation_context project
    volunteering_disabled_reason_for_context context, user
  end

  def volunteering_disabled_reason_for_context(context, user)
    if !context
      VOLUNTEERING_DISABLED_REASONS[:project_inactive]
    elsif !context.volunteering?
      VOLUNTEERING_DISABLED_REASONS[:not_volunteering]
    else
      permission_denied_reason(user, 'volunteering', context)
    end
  end

  def future_posting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !posting_idea_disabled_reason_for_context(phase, user) }
  end

  def future_commenting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !commenting_idea_disabled_reason_for_context(phase, user) }
  end

  def future_liking_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'up') }
  end

  def future_disliking_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'down') }
  end

  def future_comment_reacting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_commenting_idea_enabled_phase(project, user, time)
  end

  def future_voting_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !voting_disabled_reason_for_context(phase, user) }
  end

  def moderating_participation_context_ids(user)
    project_ids = user.moderatable_project_ids
    phase_ids = Phase.where(project_id: project_ids).pluck(:id)
    project_ids + phase_ids
  end

  def allocated_budget(project)
    Idea.from(project.ideas.select('budget * baskets_count as allocated_budget')).sum(:allocated_budget)
  end

  def allocated_budgets(projects)
    Idea.from(Idea.where(project: projects).select('project_id, budget * baskets_count as allocated_budget')).group(:project_id).sum(:allocated_budget)
  end

  private

  def future_phases(project, time)
    project.timeline? ? @timeline_service.future_phases(project, time) : []
  end

  # Common reason regardless of the reaction type.
  def general_idea_reacting_disabled_reason(context, _user)
    if !context.ideation?
      REACTING_DISABLED_REASONS[:not_ideation]
    elsif !context.reacting_enabled
      REACTING_DISABLED_REASONS[:reacting_disabled]
    end
  end

  def mode_specific_idea_reacting_disabled_reason(mode, context, user)
    case mode
    when 'up'
      if user && liking_limit_reached?(context, user)
        REACTING_DISABLED_REASONS[:reacting_like_limited_max_reached]
      end
    when 'down'
      if !context.reacting_dislike_enabled
        REACTING_DISABLED_REASONS[:reacting_dislike_disabled]
      elsif user && disliking_limit_reached?(context, user)
        REACTING_DISABLED_REASONS[:reacting_dislike_limited_max_reached]
      end
    else
      ErrorReporter.report_msg("Unsupported reaction type #{mode}")
      'unsupported_reaction_type'
    end
  end

  def posting_limit_reached?(context, user)
    return true if context.posting_limited? && context.ideas.where(author: user).size >= context.posting_limited_max

    if context.posting_limited? && context.allow_anonymous_participation?
      author_hash = Idea.create_author_hash user.id, context.id, true
      return context.ideas.where(author_hash: author_hash).or(context.ideas.where(author: user)).size >= context.posting_limited_max
    end

    false
  end

  def liking_limit_reached?(context, user)
    context.reacting_like_limited? && user.reactions.up.where(reactable: context.ideas).size >= context.reacting_like_limited_max
  end

  def disliking_limit_reached?(context, user)
    context.reacting_dislike_limited? && user.reactions.down.where(reactable: context.ideas).size >= context.reacting_dislike_limited_max
  end

  def permission_denied_reason(user, _action, _context)
    'not_signed_in' unless user
  end
end

ParticipationContextService.prepend(GranularPermissions::Patches::ParticipationContextService)
