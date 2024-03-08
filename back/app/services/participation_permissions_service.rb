# frozen_string_literal: true

class ParticipationPermissionsService < PermissionsService
  POSTING_DISABLED_REASONS = {
    project_inactive: 'project_inactive',
    project_not_visible: 'project_not_visible',
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
    super
    @timeline_service = TimelineService.new
  end

  def get_current_phase(project)
    if project.admin_publication.archived?
      nil
    else
      @timeline_service.current_phase project
    end
  end

  def posting_idea_disabled_reason_for_project(project, user)
    project_visible_reason = project_visible_disabled_reason(project, user)
    if project_visible_reason
      project_visible_reason
    else
      phase = get_current_phase project
      posting_idea_disabled_reason_for_phase(phase, user)
    end
  end

  def posting_idea_disabled_reason_for_phase(phase, user)
    if !phase
      POSTING_DISABLED_REASONS[:project_inactive]
    elsif !Factory.instance.participation_method_for(phase).posting_allowed?
      POSTING_DISABLED_REASONS[:not_ideation] # TODO: (native surveys) change reason code?
    elsif !phase.posting_enabled
      POSTING_DISABLED_REASONS[:posting_disabled]
    elsif user && posting_limit_reached?(phase, user)
      POSTING_DISABLED_REASONS[:posting_limited_max_reached]
    else
      denied_reason_for_resource(user, 'posting_idea', phase)
    end
  end

  def commenting_disabled_reason_for_idea(idea, user)
    active_phase = get_current_phase idea.project
    if !active_phase
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !idea_in_current_phase? idea, active_phase
      COMMENTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      commenting_idea_disabled_reason_for_project(idea.project, user)
    end
  end

  def commenting_idea_disabled_reason_for_project(project, user)
    project_visible_reason = project_visible_disabled_reason(project, user)
    if project_visible_reason
      project_visible_reason
    else
      phase = get_current_phase project
      commenting_idea_disabled_reason_for_phase phase, user
    end
  end

  def commenting_idea_disabled_reason_for_phase(phase, user)
    if !phase
      COMMENTING_DISABLED_REASONS[:project_inactive]
    elsif !phase.can_contain_ideas?
      COMMENTING_DISABLED_REASONS[:not_supported]
    elsif !phase.commenting_enabled
      COMMENTING_DISABLED_REASONS[:commenting_disabled]
    else
      denied_reason_for_resource(user, 'commenting_idea', phase)
    end
  end

  def reacting_disabled_reason_for_idea_comment(comment, user)
    commenting_disabled_reason_for_idea comment.post, user
  end

  def idea_reacting_disabled_reason_for(object, user, mode: nil)
    phase = nil
    idea = nil
    case object.class.name
    when Reaction.name
      mode ||= object.mode
      idea = object.reactable
      phase = get_current_phase idea.project
    when Idea.name
      idea = object
      phase = get_current_phase idea.project
    when Project.name
      phase = get_current_phase object
    when Phase.name
      # This allows checking for future or past
      # phases instead of the current phase.
      phase = object
    else
      ErrorReporter.report_msg("Unsupported context type #{object.class.name}")
      'unsupported_context_type'
    end

    # At some point, it may become more desirable
    # to either return multiple reasons or have
    # a predefined ranking of reasons to return
    # the reason with the highest rank.
    return REACTING_DISABLED_REASONS[:project_inactive] unless phase

    reason = general_idea_reacting_disabled_reason(phase, user)
    return reason if reason
    return REACTING_DISABLED_REASONS[:idea_not_in_current_phase] if idea && !idea_in_current_phase?(idea, phase)

    if mode
      reason = mode_specific_idea_reacting_disabled_reason(mode, phase, user)
      return reason if reason
    end

    denied_reason_for_resource user, 'reacting_idea', phase
  end

  def cancelling_reacting_disabled_reason_for_idea(idea, user)
    phase = get_current_phase idea.project
    if !phase
      REACTING_DISABLED_REASONS[:project_inactive]
    elsif !phase.ideation?
      REACTING_DISABLED_REASONS[:not_ideation]
    elsif !idea_in_current_phase? idea, phase
      REACTING_DISABLED_REASONS[:idea_not_in_current_phase]
    elsif !phase.reacting_enabled
      REACTING_DISABLED_REASONS[:reacting_disabled]
    else
      denied_reason_for_resource user, 'reacting_idea', get_current_phase(idea.project)
    end
  end

  def taking_survey_disabled_reason_for_project(project, user)
    project_visible_reason = project_visible_disabled_reason(project, user)
    if project_visible_reason
      project_visible_reason
    else
      phase = get_current_phase project
      taking_survey_disabled_reason_for_phase phase, user
    end
  end

  def taking_survey_disabled_reason_for_phase(phase, user)
    if !phase
      TAKING_SURVEY_DISABLED_REASONS[:project_inactive]
    elsif !phase.survey?
      TAKING_SURVEY_DISABLED_REASONS[:not_survey]
    else
      denied_reason_for_resource(user, 'taking_survey', phase)
    end
  end

  def annotating_document_disabled_reason_for_project(project, user)
    project_visible_reason = project_visible_disabled_reason(project, user)
    if project_visible_reason
      project_visible_reason
    else
      phase = get_current_phase project
      annotating_document_disabled_reason_for_phase phase, user
    end
  end

  def annotating_document_disabled_reason_for_phase(phase, user)
    if !phase
      ANNOTATING_DOCUMENT_DISABLED_REASONS[:project_inactive]
    elsif !phase.document_annotation?
      ANNOTATING_DOCUMENT_DISABLED_REASONS[:not_document_annotation]
    else
      denied_reason_for_resource(user, 'annotating_document', phase)
    end
  end

  def taking_poll_disabled_reason_for_project(project, user)
    phase = get_current_phase project
    taking_poll_disabled_reason_for_phase phase, user
  end

  def taking_poll_disabled_reason_for_phase(phase, user)
    if !phase
      TAKING_POLL_DISABLED_REASONS[:project_inactive]
    elsif !phase.poll?
      TAKING_POLL_DISABLED_REASONS[:not_poll]
    elsif user && phase.poll_responses.exists?(user: user)
      TAKING_POLL_DISABLED_REASONS[:already_responded]
    else
      denied_reason_for_resource(user, 'taking_poll', phase)
    end
  end

  def voting_disabled_reason_for_project(project, user)
    phase = get_current_phase project
    voting_disabled_reason_for_phase phase, user
  end

  def voting_disabled_reason_for_idea(idea, user)
    phase = get_current_phase idea.project
    if phase && !idea_in_current_phase?(idea, phase)
      VOTING_DISABLED_REASONS[:idea_not_in_current_phase]
    else
      voting_disabled_reason_for_phase phase, user
    end
  end

  def voting_disabled_reason_for_phase(phase, user)
    if !phase
      VOTING_DISABLED_REASONS[:project_inactive]
    elsif !phase.voting?
      VOTING_DISABLED_REASONS[:not_voting]
    else
      denied_reason_for_resource(user, 'voting', phase)
    end
  end

  # Future enabled phases
  def future_posting_idea_enabled_phase(project, user, time = Time.zone.now)
    @timeline_service.future_phases(project, time).find { |phase| !posting_idea_disabled_reason_for_phase(phase, user) }
  end

  def future_commenting_idea_enabled_phase(project, user, time = Time.zone.now)
    @timeline_service.future_phases(project, time).find { |phase| !commenting_idea_disabled_reason_for_phase(phase, user) }
  end

  def future_liking_idea_enabled_phase(project, user, time = Time.zone.now)
    @timeline_service.future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'up') }
  end

  def future_disliking_idea_enabled_phase(project, user, time = Time.zone.now)
    @timeline_service.future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'down') }
  end

  def future_comment_reacting_idea_enabled_phase(project, user, time = Time.zone.now)
    future_commenting_idea_enabled_phase(project, user, time)
  end

  def future_voting_enabled_phase(project, user, time = Time.zone.now)
    @timeline_service.future_phases(project, time).find { |phase| !voting_disabled_reason_for_phase(phase, user) }
  end

  private

  def idea_in_current_phase?(idea, current_phase = nil)
    project = idea.project
    current_phase ||= get_current_phase project
    idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
  end

  # Common reason regardless of the reaction type.
  def general_idea_reacting_disabled_reason(phase, _user)
    if !phase.ideation?
      REACTING_DISABLED_REASONS[:not_ideation]
    elsif !phase.reacting_enabled
      REACTING_DISABLED_REASONS[:reacting_disabled]
    end
  end

  def mode_specific_idea_reacting_disabled_reason(mode, phase, user)
    case mode
    when 'up'
      if user && liking_limit_reached?(phase, user)
        REACTING_DISABLED_REASONS[:reacting_like_limited_max_reached]
      end
    when 'down'
      if !phase.reacting_dislike_enabled
        REACTING_DISABLED_REASONS[:reacting_dislike_disabled]
      elsif user && disliking_limit_reached?(phase, user)
        REACTING_DISABLED_REASONS[:reacting_dislike_limited_max_reached]
      end
    else
      ErrorReporter.report_msg("Unsupported reaction type #{mode}")
      'unsupported_reaction_type'
    end
  end

  def posting_limit_reached?(phase, user)
    return true if phase.posting_limited? &&
                   phase.ideas.where(author: user, publication_status: 'published').size >= phase.posting_limited_max

    if phase.posting_limited? && phase.allow_anonymous_participation?
      author_hash = Idea.create_author_hash user.id, phase.project.id, true
      return phase.ideas.where(author_hash: author_hash).or(phase.ideas.where(author: user)).size >= phase.posting_limited_max
    end

    false
  end

  def liking_limit_reached?(phase, user)
    phase.reacting_like_limited? && user.reactions.up.where(reactable: phase.ideas).size >= phase.reacting_like_limited_max
  end

  def disliking_limit_reached?(phase, user)
    phase.reacting_dislike_limited? && user.reactions.down.where(reactable: phase.ideas).size >= phase.reacting_dislike_limited_max
  end

  def project_visible_disabled_reason(project, user)
    if (project.visible_to == 'admins' && !user.admin?) ||
       (project.visible_to == 'groups' && !user.in_any_groups?(project.groups))
      POSTING_DISABLED_REASONS[:project_not_visible]
    end
  end
end
