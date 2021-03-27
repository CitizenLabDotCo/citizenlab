module PublicApi
  class PublicApiPolicy
    attr_reader :api_client, :record

    def initialize(api_client, record)
      @api_client = api_client
      @record = record
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        scope
      end
    end

  end
end