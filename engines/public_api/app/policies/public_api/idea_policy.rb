module PublicApi
  class IdeaPolicy < PublicApiPolicy

    class Scope
      attr_reader :api_token, :scope

      def initialize(api_token, scope)
        @api_token  = api_token
        @scope = scope
      end

      def resolve
        scope.published
      end
    end


    def show
      record.published?
    end


  end
end