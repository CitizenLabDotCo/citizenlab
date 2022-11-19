# frozen_string_literal: true

module PublicApi
  class PhasePolicy < PublicApiPolicy
    class Scope
      def initialize(api_client, scope)
        @api_client = api_client
        @scope = scope
      end

      def resolve
        # We base this on the same scope as a non-authenticated user
        ::PhasePolicy::Scope.new(nil, scope).resolve
      end

      private

      attr_reader :api_client, :scope
    end

    def show?
      # We base this on the same rules a non-authenticated user
      ::PhasePolicy.new(nil, record).show?
    end
  end
end
