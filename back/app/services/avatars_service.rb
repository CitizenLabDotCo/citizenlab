class AvatarsService

  def initialize participants_service=ParticipantsService.new
    @participants_service = participants_service
  end

  def avatars_for_project project, users: User.active, limit: 5
    Rails.cache.fetch("#{project.cache_key}/avatars", expires_in: 1.day) do
      participants = @participants_service.project_participants(project)
      add_count(users.merge(participants), limit)
    end
  end

  def avatars_for_group group, users: User.active, limit: 5
    Rails.cache.fetch("#{group.cache_key}/avatars", expires_in: 1.day) do
      users_in_group = users.merge(group.members)
      add_count(users_in_group, limit)
    end
  end

  def avatars_for_post post, post_type, users: User.active, limit: 5
    Rails.cache.fetch("#{post.cache_key}/avatars", expires_in: 1.day) do
      commenters = users.joins(:comments).where(comments: {post_id: post.id, post_type: post_type, publication_status: 'published'})
      users_for_post = users.where(id: post.author).or(users.where(id: commenters))
      add_count(users_for_post, limit)
    end
  end

  def avatars_for_idea idea, users: User.active, limit: 5
    avatars_for_post idea, 'Idea', users: users, limit: limit
  end

  def avatars_for_initiative initiative, users: User.active, limit: 5
    avatars_for_post initiative, 'Initiative', users: users, limit: limit
  end

  def some_avatars users: User.active, limit: 5
    Rails.cache.fetch(users, expires_in: 1.day) do
      add_count(users, limit)
    end
  end

  private

  def add_count users, limit
    {
      users: with_avatars(users, limit).load,
      total_count: users.size
    }
  end

  def with_avatars users, limit
    users
      .where.not(avatar: nil)
      .limit(limit)
      .order(Arel.sql('random()'))
  end
end