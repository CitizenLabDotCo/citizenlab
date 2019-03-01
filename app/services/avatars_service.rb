class AvatarsService

  def avatars_for_project project, users: User.active, limit: 5
    Rails.cache.fetch("#{project.cache_key}/avatars", expires_in: 1.day) do
      users_in_project = users
        .where("EXISTS(SELECT 1 FROM ideas WHERE author_id = users.id AND project_id = ?)", project.id)

      add_count(users_in_project, limit)
    end
  end

  def avatars_for_group group, users: User.active, limit: 5
    Rails.cache.fetch("#{group.cache_key}/avatars", expires_in: 1.day) do
      users_in_group = users.merge(group.members)
      add_count(users_in_group, limit)
    end
  end

  def avatars_for_tenant users: User.active, limit: 5
    Rails.cache.fetch(users, expires_in: 1.day) do
      add_count(users, limit)
    end
  end

  private

  def add_count users, limit
    {
      users: with_avatars(users, limit),
      total_count: users.count
    }
  end

  def with_avatars users, limit
    users
      .where.not(avatar: nil)
      .limit(limit)
      .order(Arel.sql('random()'))
  end
end