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

  VOTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_ideation: 'not_ideation',
    voting_disabled: 'voting_disabled',
    downvoting_disabled: 'downvoting_disabled',
    upvoting_limited_max_reached: 'upvoting_limited_max_reached',
    downvoting_limited_max_reached: 'downvoting_limited_max_reached',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }.freeze

  BUDGETING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    not_budgeting: 'not_budgeting',
    idea_not_in_current_phase: 'idea_not_in_current_phase'
  }.freeze

  DOCUMENT_ANNOTATION_DISABLED_REASONS = {
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

  def participation_possible_for_context?(context, user)
    return true if context.information?

    !(posting_idea_disabled_reason_for_context(context, user) \
    && commenting_idea_disabled_reason_for_context(context, user) \
    && idea_voting_disabled_reason_for(context, user) \
    && document_annotation_disabled_reason_for_context(context, user) \
    && taking_survey_disabled_reason_for_context(context, user) \
    && taking_poll_disabled_reason_for_context(context, user) \
    && budgeting_disabled_reason_for_context(context, user))
  end

  def posting_idea_disabled_reason_for_project(project, user)
    context = project && get_participation_context(project)
    posting_idea_disabled_reason_for_context context, user
  end

  def posting_idea_disabled_reason_for_context(context, user)
    if !context
      POSTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation? && !context.native_survey?
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

  def voting_disabled_reason_for_idea_comment(comment, user)
    commenting_disabled_reason_for_idea comment.post, user
  end

  def idea_voting_disabled_reason_for(object, user, mode: nil)
    context = nil
    idea = nil
    case object.class.name
    when Vote.name
      mode ||= object.mode
      idea = object.votable
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
    return VOTING_DISABLED_REASONS[:project_inactive] unless context

    reason = general_idea_voting_disabled_reason(context, user)
    return reason if reason
    return VOTING_DISABLED_REASONS[:idea_not_in_current_phase] if idea && !in_current_context?(idea, context)

    if mode
      reason = mode_specific_idea_voting_disabled_reason(mode, context, user)
      return reason if reason
    end

    permission_denied_reason user, 'voting_idea', context
  end

  def cancelling_votes_disabled_reason_for_idea(idea, user)
    context = get_participation_context idea.project
    if !context
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !context.ideation?
      VOTING_DISABLED_REASONS[:not_ideation]
    elsif !in_current_context? idea, context
      VOTING_DISABLED_REASONS[:idea_not_in_current_phase]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    else
      permission_denied_reason user, 'voting_idea', get_participation_context(idea.project)
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

  def document_annotation_disabled_reason_for_project(project, user)
    context = get_participation_context project
    document_annotation_disabled_reason_for_context context, user
  end

  def document_annotation_disabled_reason_for_context(context, user)
    if !context
      DOCUMENT_ANNOTATION_DISABLED_REASONS[:project_inactive]
    elsif !context.survey?
      DOCUMENT_ANNOTATION_DISABLED_REASONS[:not_document_annotation]
    else
      permission_denied_reason(user, 'document_annotation', context)
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

  def budgeting_disabled_reason_for_idea(idea, user)
    context = get_participation_context idea.project
    if context && !in_current_context?(idea, context)
      BUDGETING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      budgeting_disabled_reason_for_context context, user
    end
  end

  def budgeting_disabled_reason_for_context(context, user)
    if !context
      BUDGETING_DISABLED_REASONS[:project_inactive]
    elsif !context.budgeting?
      BUDGETING_DISABLED_REASONS[:not_budgeting]
    else
      permission_denied_reason(user, 'budgeting', context)
    end
  end

  def future_posting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !posting_idea_disabled_reason_for_context(phase, user) }
  end

  def future_commenting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !commenting_idea_disabled_reason_for_context(phase, user) }
  end

  def future_upvoting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !idea_voting_disabled_reason_for(phase, user, mode: 'up') }
  end

  def future_downvoting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !idea_voting_disabled_reason_for(phase, user, mode: 'down') }
  end

  def future_comment_voting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_commenting_idea_enabled_phase(project, user, time)
  end

  def future_budgeting_enabled_phase(project, user, time = Time.zone.now)
    future_phases(project, time).find { |phase| !budgeting_disabled_reason_for_context(phase, user) }
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

  # Common reason regardless of the vote type.
  def general_idea_voting_disabled_reason(context, _user)
    if !context.ideation?
      VOTING_DISABLED_REASONS[:not_ideation]
    elsif !context.voting_enabled
      VOTING_DISABLED_REASONS[:voting_disabled]
    end
  end

  def mode_specific_idea_voting_disabled_reason(mode, context, user)
    case mode
    when 'up'
      if user && upvoting_limit_reached?(context, user)
        VOTING_DISABLED_REASONS[:upvoting_limited_max_reached]
      end
    when 'down'
      if !context.downvoting_enabled
        VOTING_DISABLED_REASONS[:downvoting_disabled]
      elsif user && downvoting_limit_reached?(context, user)
        VOTING_DISABLED_REASONS[:downvoting_limited_max_reached]
      end
    else
      ErrorReporter.report_msg("Unsupported vote type #{mode}")
      'unsupported_vote_type'
    end
  end

  def posting_limit_reached?(context, user)
    context.posting_limited? && context.ideas.where(author: user).size >= context.posting_limited_max
  end

  def upvoting_limit_reached?(context, user)
    context.upvoting_limited? && user.votes.up.where(votable: context.ideas).size >= context.upvoting_limited_max
  end

  def downvoting_limit_reached?(context, user)
    context.downvoting_limited? && user.votes.down.where(votable: context.ideas).size >= context.downvoting_limited_max
  end

  def permission_denied_reason(user, _action, _context)
    'not_signed_in' unless user
  end
end

ParticipationContextService.prepend(GranularPermissions::Patches::ParticipationContextService)
