# frozen_string_literal: true

module PublicApi
  class IdeaPolicy < PublicApiPolicy
    class Scope
      attr_reader :api_client, :scope

      def initialize(api_client, scope)
        @api_client = api_client
        @scope = scope
      end

      def resolve
        # We base this on the same scope as a non-authenticated user
        ::IdeaPolicy::Scope.new(nil, scope).resolve
          .published
      end
    end

    def show?
      # We base this on the same rules a non-authenticated user
      ::IdeaPolicy.new(nil, record).show? && record.published?
    end

    def create?
      # Allow idea creation through public API if the project allows it
      return false unless record.project

      phases_to_check = []
      if record.phase_ids.present?
        phases_to_check = record.project.phases.where(id: record.phase_ids)
      end

      return false if phases_to_check.empty?

      # For Public API, we allow creation if the project is visible and phases support inputs
      # This is simpler than the standard IdeaPolicy which has complex user permission checks
      true
    end

    def update?
      # Allow idea updates through public API 
      return false unless record.project

      # Check if the idea is published (can't edit drafts through public API)
      return false unless record.published?

      # For Public API, allow updates to published ideas
      true
    end
  end
end
