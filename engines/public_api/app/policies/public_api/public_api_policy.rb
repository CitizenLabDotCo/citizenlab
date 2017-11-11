module PublicApi
  class PublicApiPolicy
    attr_reader :api_token, :record

    def initialize(api_token, record)
      @api_token = api_token
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