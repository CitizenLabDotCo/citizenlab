# frozen_string_literal: true

class ParticipantsService
  ENGAGING_ACTIVITIES = [
    { item_type: 'Comment', action: 'created', score: 3 },
    { item_type: 'Idea', action: 'published', score: 5 },
    { item_type: 'Reaction', action: 'idea_liked', score: 1 },
    { item_type: 'Reaction', action: 'idea_disliked', score: 1 },
    { item_type: 'Reaction', action: 'comment_liked', score: 1 },
    { item_type: 'Reaction', action: 'comment_disliked', score: 1 },
    { item_type: 'Basket', action: 'created', score: 3 },
    { item_type: 'Polls::Response', action: 'created', score: 1 },
    { item_type: 'Volunteering::Volunteer', action: 'created', score: 3 }
  ]

  PARTICIPANT_ACTIONS = %i[posting commenting idea_reacting comment_reacting voting polling volunteering]

  def participants(options = {})
    since = options[:since]
    to = options[:to]
    # After https://stackoverflow.com/a/25356375
    list = (['(?, ?)'] * ENGAGING_ACTIVITIES.size).join(', ')
    multiwhere = "(activities.item_type, activities.action) IN (#{list})"
    users = User
      .joins(:activities)
      .where(
        multiwhere,
        *ENGAGING_ACTIVITIES.map { |h| [h[:item_type], h[:action]] }.flatten
      ).group('users.id')

    if since && to
      users.where('activities.acted_at::date >= ? AND activities.acted_at::date < ?', since, to)
    elsif since
      users.where('activities.acted_at::date >= ?', since)
    else
      users
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
    actions = options[:actions] || PARTICIPANT_ACTIONS
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
    actions = options[:actions] || PARTICIPANT_ACTIONS
    ideas = Idea.where(project: projects)
    participants = ideas_participants(ideas, options)
    # voting
    if actions.include? :voting
      baskets = Basket.submitted
      baskets = baskets.where(participation_context: projects)
        .or(baskets.where(participation_context: Phase.where(project: projects)))
      baskets = baskets.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: baskets.select(:user_id)))
    end
    # Polling
    if actions.include? :polling
      poll_responses = Polls::Response.where(participation_context: projects)
        .or(Polls::Response.where(participation_context: Phase.where(project: projects)))
      poll_responses = poll_responses.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: poll_responses.select(:user_id)))
    end
    # Volunteering
    if actions.include? :volunteering
      volunteering_users = User.joins(volunteers: [:cause])
      volunteering_users = volunteering_users.where(volunteering_causes: { participation_context: projects })
        .or(volunteering_users.where(volunteering_causes: { participation_context: Phase.where(project: projects) }))
      participants = participants.or(User.where(id: volunteering_users))
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

  # Adapts the passed activities_scope to only take into account activities
  # that should truly be taken into account as actual activity generated by
  # the user. E.g. Creating a reaction is a truly engaging activity, whereas
  # receiving project moderation rights is not
  def filter_engaging_activities(activities_scope)
    output = activities_scope
    ENGAGING_ACTIVITIES.each.with_index do |activity, i|
      output = if i == 0
        output.where(item_type: activity[:item_type], action: activity[:action])
      else
        output.or(
          activities_scope.where(item_type: activity[:item_type], action: activity[:action])
        )
      end
    end
    output
  end

  # Adds a `score` field to the results, indicating the engagement score for the activity
  def with_engagement_scores(activities_scope)
    activities_scope
      .select("(CASE
        #{ENGAGING_ACTIVITIES.map do |activity|
            "WHEN item_type = '#{activity[:item_type]}' AND action = '#{activity[:action]}' THEN #{activity[:score]}"
          end.join(' ')
        }
      ELSE 0 END) as score")
  end
end
