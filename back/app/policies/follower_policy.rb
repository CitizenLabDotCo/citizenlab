# frozen_string_literal: true

class FollowerPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if !user

      @scope = scope.where(user: user)
      # We hide followers where the followable is no longer accessible, so we
      # don't expose private information. This is because the followable is
      # included. It's fine to allow show? in this case, as we don't include
      # the followable in this case.
      filter_followables
      scope
    end

    private

    def filter_followables
      Follower::FOLLOWABLE_TYPES.each do |followable_type|
        visible_records = scope_for(followable_type.constantize)
        @scope = scope.where(followable: visible_records).or(scope.where.not(followable_type: followable_type))
      end
    end
  end

  def create?
    return false if !user

    if user.active? && record.user_id == user.id
      policy_class = case record.followable_type
      when 'Project'
        ProjectPolicy
      when 'ProjectFolders::Folder'
        ProjectFolders::FolderPolicy
      when 'Idea'
        IdeaPolicy
      when 'GlobalTopic'
        GlobalTopicPolicy
      when 'Area'
        AreaPolicy
      else
        raise "Unsupported followable type: #{record.followable_type}"
      end
      policy_class.new(user_context, record.followable).show?
    else
      false
    end
  end

  def show?
    return false if !user

    record.user_id == user.id
  end

  def destroy?
    return false if !user

    record.user_id == user.id
  end
end
