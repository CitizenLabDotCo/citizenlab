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
    following
  ]

  def participants(options = {})
    since = options[:since]
    to = options[:to]

    participants = Analytics::FactParticipation
      .select(:dimension_user_id).distinct
      .where.not(dimension_user_id: nil)

    if since && to
      participants.where('dimension_date_created_id >= ? AND dimension_date_created_id < ?', since, to)
    elsif since
      participants.where('dimension_date_created_id >= ?', since)
    else
      participants
    end
  end

  def initiatives_participants(initiatives)
    participants = User.none

    # Posting
    participants = participants.or(User.where(id: initiatives.select(:author_id)))

    # Commenting
    comments = Comment.where(post: initiatives)
    participants = participants.or(User.where(id: comments.select(:author_id)))

    # Initiative reacting
    reactions = Reaction.where(reactable: initiatives)
    participants = participants.or(User.where(id: reactions.select(:user_id)))

    # Comment reacting
    reactions = Reaction.where(reactable: comments)
    participants.or(User.where(id: reactions.select(:user_id)))
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
    comments = Comment.where(post_id: ideas)
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
    participant_ids = Rails.cache.fetch("#{project.cache_key}/participant_ids", expires_in: 1.day) do
      projects_participants([project]).pluck(:id)
    end
    User.where(id: participant_ids)
  end

  # Returns the total count of all project participants including anonymous posts - cached
  def project_participants_count(project)
    Rails.cache.fetch("#{project.cache_key}/participant_count", expires_in: 1.day) do
      participant_ids = projects_participants([project]).pluck(:id)
      known_author_hashes = participant_ids.map { |id| Idea.create_author_hash(id, project.id, true) }
      participant_ids.size + projects_anonymous_count([project], known_author_hashes) + projects_everyone_count([project])
    end
  end

  # Returns the total count of all folder participants including anonymous posts - cached
  def folder_participants_count(folder)
    Rails.cache.fetch("#{folder.cache_key}/participant_count", expires_in: 1.day) do
      participant_ids = projects_participants(folder.projects).pluck(:id)
      known_author_hashes = participant_ids.flat_map do |id|
        folder.projects.ids { |project_id| Idea.create_author_hash(id, project_id, true) }
      end
      participant_ids.size + projects_anonymous_count(folder.projects, known_author_hashes) + projects_everyone_count(folder.projects)
    end
  end

  def projects_anonymous_count(projects, known_author_hashes)
    anonymous_idea_hashes = Idea.where(project: projects, anonymous: true)
      .where.not(author_hash: known_author_hashes)
      .distinct.pluck(:author_hash)
    anonymous_comment_hashes = Comment.joins(:idea)
      .where(anonymous: true)
      .where(idea: { project: projects })
      .where.not(author_hash: known_author_hashes + anonymous_idea_hashes)
      .distinct.pluck(:author_hash)
    anonymous_idea_hashes.size + anonymous_comment_hashes.size
  end

  def projects_everyone_count(projects)
    Idea.where(project: projects, author: nil, anonymous: false).size
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
      event_attendances = Events::Attendance.where(event: Event.where(project: projects))
      event_attendances = event_attendances.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: event_attendances.select(:attendee_id)))
    end

    # Following
    if actions.include? :following
      followers = Follower.where(followable: projects)
      followers = followers.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: followers.select(:user_id)))
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
end
