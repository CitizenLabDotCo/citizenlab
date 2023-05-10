# frozen_string_literal: true

module PublicApi
  class UserPolicy < PublicApiPolicy
    class Scope
      attr_reader :api_client, :scope

      def initialize(api_client, scope)
        @api_client = api_client
        @scope = scope
      end

      def resolve
        # We base this on the same scope as a non-authenticated user
        ::UserPolicy::Scope.new(nil, scope).resolve
      end
    end

    def show?
      # We base this on the same rules a non-authenticated user
      ::UserPolicy.new(nil, record).show?
    end
  end
end
