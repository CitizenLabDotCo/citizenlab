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

        scope.where.not(
          # views with data sources that are not moderated by the user
          id: scope.joins(:data_sources).where.not(data_sources: { origin_id: user.moderatable_project_ids })
        )
      end
    end

    def show?
      allowed?
    end

    def create?
      allowed?
    end

    def update?
      allowed?
    end

    def destroy?
      allowed?
    end

    private

    def allowed?
      return unless active?

      admin? || moderates_all_origins?(user, record)
    end

    def moderates_all_origins?(user, view)
      # Using `select` instead of a `where` clause because the view and its data sources
      # might not have been persisted yet (create action). In which case, the `where`
      # clause would return an empty list of data sources.
      origin_ids = view.data_sources.select { |ds| ds.origin_type == 'Project' }
                       .pluck(:origin_id).to_set
      origin_ids <= user.moderatable_project_ids.to_set
    end
  end
end
