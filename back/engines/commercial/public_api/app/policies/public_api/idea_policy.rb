module PublicApi
  class IdeaPolicy < PublicApiPolicy

    class Scope
      attr_reader :api_client, :scope

      def initialize(api_client, scope)
        @api_client  = api_client
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

  end
end