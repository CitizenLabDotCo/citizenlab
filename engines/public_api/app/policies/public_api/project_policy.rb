module PublicApi
  class ProjectPolicy < PublicApiPolicy

    class Scope
      attr_reader :api_client, :scope

      def initialize(api_client, scope)
        @api_client = api_client
        @scope = scope
      end

      def resolve
        # We base this on the same scope as a non-authenticated user
        ::ProjectPolicy::Scope.new(nil, scope)
                              .resolve
                              .includes(:admin_publication)
                              .where.not(admin_publications: { publication_status: 'draft' })
      end
    end

    def show?
      # We base this on the same rules a non-authenticated user
      ::ProjectPolicy.new(nil, record).show?
    end
  end
end
