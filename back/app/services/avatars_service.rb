# frozen_string_literal: true

# Provides avatars and total participation numbers for projects, groups, posts, ideas and other records based on their
# participants.
class AvatarsService
  def initialize(participants_service = ParticipantsService.new)
    @participants_service = participants_service
  end

  # Returns a hash containing a list of users with avatars for a project and the total number of participants.
  # @param project[Project] The project for which avatars of its paticipants should be fetched
  # @param users[ActiveRecord::Relation] Scope of users to be filtered for avatars
  # @param limit[Integer] Limit the number of users returned. Does not affect the total count
  # @return [Hash] A hash containing the users with avatars and total count of participants
  def avatars_for_project(project, users: User.registered, limit: 5)
    Rails.cache.fetch("#{project.cache_key}/user_avatars", expires_in: 1.day) do
      participants = @participants_service.project_participants(project)
      user_ids = fetch_user_ids_and_count(participants, limit)
      participant_count = @participants_service.project_participants_count(project)
      users_and_count(user_ids, participant_count)
    end
  end

  # Returns a hash containing a list of users with avatars for a folder and the total number of participants.
  def avatars_for_folder(folder, users: User.registered, limit: 5)
    Rails.cache.fetch("#{folder.cache_key}/user_avatars", expires_in: 1.day) do
      participants = @participants_service.projects_participants(folder.projects)
      user_ids = fetch_user_ids_and_count(participants, limit)
      participant_count = @participants_service.folder_participants_count(folder)
      users_and_count(user_ids, participant_count)
    end
  end

  # Returns a hash containing a list of users with avatars for a group and the total member count.
  # @param group[Group] The group for which avatars of its members should be fetched
  # @param users[ActiveRecord::Relation] Scope of users to be filtered for avatars
  # @param limit[Integer] Limit the number of users returned. Does not affect the total count
  # @return [Hash] A hash containing the users with avatars and total count of participants
  def avatars_for_group(group, users: User.registered, limit: 5)
    user_ids_and_count = Rails.cache.fetch("#{group.cache_key}/user_avatars", expires_in: 1.day) do
      users_in_group = users.merge(group.members)
      fetch_user_ids_and_count(users_in_group, limit)
    end
    users_and_count(user_ids_and_count)
  end

  # Returns a hash containing a list of users with avatars for an idea and the total member count.
  # @param idea[Idea] The group for which avatars of its members should be fetched
  # @param users[ActiveRecord::Relation] Scope of users to be filtered for avatars
  # @param limit[Integer] Limit the number of users returned. Does not affect the total count
  # @return [Hash] A hash containing the users with avatars and total count of participants
  def avatars_for_idea(idea, users: User.active, limit: 5)
    user_ids_and_count = Rails.cache.fetch("#{idea.cache_key}/user_avatars", expires_in: 1.day) do
      commenters = users.joins(:comments).where(comments: { idea_id: idea.id, publication_status: 'published' })
      users_for_idea = users.where(id: idea.author).or(users.where(id: commenters))
      fetch_user_ids_and_count(users_for_idea, limit)
    end
    users_and_count(user_ids_and_count)
  end

  # Returns a hash containing a list of users with avatars
  # @param users[ActiveRecord::Relation] Scope of users to be filtered for avatars
  # @param limit[Integer] Limit the number of users returned. Does not affect the total count
  # @return [Hash] A hash containing the users with avatars and total count of participants
  def some_avatars(users: User.active, limit: 5)
    user_ids_and_count = Rails.cache.fetch("#{users.cache_key}/user_avatars", expires_in: 1.day) do
      fetch_user_ids_and_count(users, limit)
    end
    users_and_count(user_ids_and_count)
  end

  private

  # Given a hash of user ids and count, returns a hash of users and the count.
  def users_and_count(user_ids_and_count, count = nil)
    {
      users: User.where(id: [user_ids_and_count.fetch(:user_ids)]),
      total_count: count || user_ids_and_count.fetch(:total_count)
    }
  end

  # Returns the user ids of users with avatars and the total count of users (with and without avatars!)
  # Suitable for caching
  def fetch_user_ids_and_count(users, limit)
    {
      user_ids: users_with_avatars(users).limit(limit).pluck(:id),
      total_count: users.count
    }
  end

  # Returns random users who have avatars
  def users_with_avatars(users)
    users
      .where.not(avatar: nil)
      .order(Arel.sql('random()'))
  end
end
