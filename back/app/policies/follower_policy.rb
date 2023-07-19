# frozen_string_literal: true

class FollowerPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      @scope = scope.where(user: user)
      filter_projects
      scope
    end

    private

    def filter_projects
      visible_projects = Pundit.policy_scope user, Project
      @scope = scope.where(followable: visible_projects).or(scope.where.not(followable_type: 'Project'))
    end
  end

  def create?
    if user.active? && record.user_id == user.id
      case record.followable_type
      when 'Project'
        ProjectPolicy.new(user, record.followable).show?
      else
        raise "Unsupported followable type: #{record.followable_type}"
      end
    else
      false
    end
  end

  def show?
    record.user_id == user.id
  end

  def destroy?
    record.user_id == user.id
  end
end
