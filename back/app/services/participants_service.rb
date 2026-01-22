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

  # Returns a hash of project IDs to participant counts for the given projects.
  # Uses cached data.
  def projects_participants_counts(projects)
    projects.each_with_object({}) do |project, counts|
      counts[project.id] = project_participants_count(project)
    end
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
    ideas = Idea.where(project: projects).where.not(publication_status: 'draft')
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

  def input_topics_participants(input_topics, options = {})
    ideas = Idea.with_some_input_topics(input_topics)
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

  # @param user [User] The user to get participation stats for
  # @return [Hash] Counts of each participation type
  def user_participation_stats(user)
    idea_counts = user.ideas.published
      .reorder(nil) # default ORDER BY on user.ideas conflicts with the GROUP BY
      .left_joins(:creation_phase)
      .group("COALESCE(phases.participation_method, 'ideation')")
      .count

    {
      ideas_count: idea_counts['ideation'] || 0,
      proposals_count: idea_counts['proposals'] || 0,
      survey_responses_count: idea_counts['native_survey'] || 0,
      comments_count: user.comments.published.count,
      reactions_count: user.reactions.count,
      baskets_count: user.baskets.submitted.count,
      poll_responses_count: user.poll_responses.count,
      volunteers_count: user.volunteers.count,
      event_attendances_count: user.event_attendances.count
    }
  end

  # Destroys all participation data for a user.
  def destroy_user_participation_data(user)
    project_ids = participated_project_ids(user)

    # Capture phases with submitted baskets before destroying them
    # (needed to update baskets_count/votes_count since Basket doesn't use counter_culture)
    phases_with_submitted_baskets = Phase.where(id: user.baskets.submitted.distinct.select(:phase_id)).to_a

    # This is probably not the most efficient way to delete all participation, but it has
    # the advantage of being simple by relying on ActiveRecord callbacks. It can be
    # optimized later if needed.
    ActiveRecord::Base.transaction do
      # Comments are marked as deleted instead of being removed, so we don't delete
      # the replies and preserve the thread structure. Must be done before ideas
      # are destroyed since comments belong to ideas.
      # Using +update+ instead of +update_all+ to trigger counter_culture callbacks.
      user.comments.published.find_each do |comment|
        comment.update!(publication_status: 'deleted')
      end

      user.reactions.destroy_all
      user.ideas.destroy_all
      user.baskets.destroy_all
      user.poll_responses.destroy_all
      user.volunteers.destroy_all
      user.event_attendances.destroy_all

      phases_with_submitted_baskets.each { |phase| Basket.update_counts(phase) }
    end

    Project.where(id: project_ids).each do |project|
      clear_project_participants_count_cache(project)
    end
  end

  private

  def participated_project_ids(user)
    Analytics::FactParticipation
      .where(dimension_user_id: user.id)
      .pluck(:dimension_project_id)
      .compact
      .uniq
  end
end
