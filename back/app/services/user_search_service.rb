# frozen_string_literal: true

class UserSearchService
  def search(query, idea_id: nil, admins_and_moderators: false, limit: 5, exclude_user: nil)
    users = User.active.by_username(query)
    users = users.admin_or_moderator if admins_and_moderators

    results = []

    if idea_id.present?
      # Only include posting and commenting. Including other actions (e.g. voting)
      # would allow users to infer who voted through the mention search.
      participants = ParticipantsService.new.ideas_participants(
        Idea.where(id: idea_id),
        actions: %i[posting commenting]
      )
      results = users.where(id: participants).limit(limit).to_a
    end

    remaining = limit - results.size
    if remaining.positive?
      results += users.where.not(id: results).limit(remaining).to_a
    end

    results.excluding(exclude_user)
  end
end
