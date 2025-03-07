# frozen_string_literal: true

class ParticipantsService
  PROJECT_PARTICIPANT_ACTIONS = %i[
    posting
    commenting
    idea_reacting
    comment_reacting
    voting
    polling
    volunteering
    event_attending
  ]

  def participants(options = {})
    since = options[:since]
    to = options[:to]

    Analytics::FactParticipation
      .select(:dimension_user_id).distinct
      .where.not(dimension_user_id: nil)
      .where(dimension_date_created_id: since..to)
  end

  def ideas_participants(ideas, options = {})
    since = options[:since]
    actions = options[:actions] || PROJECT_PARTICIPANT_ACTIONS
    participants = User.none

    # Posting
    if actions.include? :posting
      ideas_since = if since
        ideas.where('created_at::date >= (?)::date', since)
      else
        ideas
      end
      participants = participants.or(User.where(id: ideas_since.select(:author_id)))
    end

    # Commenting
    comments = Comment.where(idea: ideas)
    if actions.include? :commenting
      comments_since = if since
        comments.where('created_at::date >= (?)::date', since)
      else
        comments
      end
      participants = participants.or(User.where(id: comments_since.select(:author_id)))
    end

    # Idea reacting
    if actions.include? :idea_reacting
      reactions = Reaction.where(reactable_id: ideas)
      reactions = reactions.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: reactions.select(:user_id)))
    end

    # Comment reacting
    if actions.include? :comment_reacting
      reactions = Reaction.where(reactable_id: comments)
      reactions = reactions.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: reactions.select(:user_id)))
    end
    participants
  end

  # Returns all the known participants of a single project - cached.
  # @param project[Project]
  # @return[ActiveRecord::Relation] List of users that participated in the project
  def project_participants(project)
    is_active = TimelineService.new.timeline_active(project) == :present
    expires_in = is_active ? 1.hour : 1.day

    participant_ids = Rails.cache.fetch("#{project.cache_key}/participant_ids", expires_in: expires_in) do
      projects_participants([project]).pluck(:id)
    end

    User.where(id: participant_ids)
  end

  # Returns the total count of all project participants including anonymous posts - cached
  def project_participants_count(project)
    is_active = TimelineService.new.timeline_active(project) == :present
    expires_in = is_active ? 30.minutes : 1.day

    Rails.cache.fetch("#{project.cache_key}/participant_count", expires_in: expires_in) do
      project_participants_count_uncached(project)
    end
  end

  def project_participants_count_uncached(project)
    Analytics::FactParticipation
      .where(dimension_project_id: project.id)
      .select(:participant_id)
      .distinct
      .count
  end

  def clear_project_participants_count_cache(project)
    Rails.cache.delete("#{project.cache_key}/participant_count")
  end

  # Returns the total count of all folder participants including anonymous posts - cached
  def folder_participants_count(folder)
    Rails.cache.fetch("#{folder.cache_key}/participant_count", expires_in: 1.day) do
      Analytics::FactParticipation
        .where(dimension_project_id: folder.projects)
        .distinct
        .count(:participant_id)
    end
  end

  def projects_participants(projects, options = {})
    since = options[:since]
    actions = options[:actions] || PROJECT_PARTICIPANT_ACTIONS
    ideas = Idea.where(project: projects)
    participants = ideas_participants(ideas, options)

    # Voting
    if actions.include? :voting
      baskets = Basket.submitted
      baskets = baskets.where(phase: Phase.where(project: projects))
      baskets = baskets.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: baskets.select(:user_id)))
    end

    # Polling
    if actions.include? :polling
      poll_responses = Polls::Response.where(phase: Phase.where(project: projects))
      poll_responses = poll_responses.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: poll_responses.select(:user_id)))
    end

    # Volunteering
    if actions.include? :volunteering
      volunteering_users = User.joins(volunteers: [:cause])
      volunteering_users = volunteering_users.where(volunteering_causes: { phase: Phase.where(project: projects) })
      participants = participants.or(User.where(id: volunteering_users))
    end

    # Event attending
    if actions.include? :event_attending
      event_attendances = Events::Attendance
        .joins(:event).where(events: { project: projects })
        .where(created_at: since..)
      event_attendees = User.where(id: event_attendances.select(:attendee_id))
      participants = participants.or(event_attendees)
    end

    participants
  end

  def topics_participants(topics, options = {})
    ideas = Idea.with_some_topics(topics)
    ideas_participants ideas, options
  end

  def idea_statuses_participants(idea_statuses, options = {})
    ideas = Idea.where(idea_status: idea_statuses)
    ideas_participants ideas, options
  end

  def destroy_participation_data(project)
    # Destroy volunteers data
    Volunteering::Volunteer
      .joins(cause: { phase: :project })
      .where(cause: { phases: { project_id: project.id } })
      .destroy_all

    # Destroy event attendance data
    Events::Attendance
      .joins(event: :project)
      .where(events: { project_id: project.id })
      .destroy_all

    # Destroy poll data
    Polls::Response
      .joins(phase: :project)
      .where(phases: { project_id: project.id })
      .destroy_all

    # Destroy comments, reactions and baskets data
    Comment.where(idea: project.ideas).destroy_all
    Reaction.where(reactable: project.ideas).destroy_all
    Basket.where(phase: project.phases).destroy_all

    # We must update_counts explicitly because the current implementation of Basket does
    # not use `counter_culture`.
    project.phases.each { |phase| Basket.update_counts(phase) }

    # Destroy only ideas that are not in voting phases.
    # (Ideas in voting phases are considered part of the project setup.)
    voting_phases = project.phases.where(participation_method: 'voting')
    ideas_in_voting_phases = IdeasPhase.where(phase: voting_phases).select(:idea_id)
    Idea.where(project: project).where.not(id: ideas_in_voting_phases).destroy_all
  end
end
