# frozen_string_literal: true

module Insights
  class ViewPolicy < ::ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        raise Pundit::NotAuthorizedError unless user&.active?
        return scope.all if user.admin?
        raise Pundit::NotAuthorizedError unless user.project_moderator?

        scope.joins(:data_sources).where(data_sources: { origin_id: user.moderatable_project_ids })
      end
    end

    def show?
      user&.active_admin_or_moderator?(record.scope.id)
    end

    def create?
      user&.active_admin_or_moderator?(record.scope.id)
    end

    def update?
      user&.active_admin_or_moderator?(record.scope.id)
    end

    def destroy?
      user&.active_admin_or_moderator?(record.scope.id)
    end
  end
end
