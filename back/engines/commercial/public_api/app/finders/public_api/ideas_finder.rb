# frozen_string_literal: true

module PublicApi
  class IdeasFinder
    def initialize(scope, user_id: nil)
      @scope = scope
      @user_id = user_id
    end

    def execute
      @scope.then { |scope| filter_by_user_id(scope) }
    end

    private

    def filter_by_user_id(scope)
      return scope unless @user_id

      scope.where(author_id: @user_id)
    end
  end
end
