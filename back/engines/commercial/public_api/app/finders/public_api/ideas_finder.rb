# frozen_string_literal: true

module PublicApi
  class IdeasFinder
    def initialize(scope, user_id: nil, project_id: nil)
      @scope = scope
      @user_id = user_id
      @project_id = project_id
    end

    def execute
      @scope
        .then { |scope| filter_by_user_id(scope) }
        .then { |scope| filter_by_project_id(scope) }
    end

    private

    def filter_by_user_id(scope)
      return scope unless @user_id

      scope.where(author_id: @user_id)
    end

    def filter_by_project_id(scope)
      return scope unless @project_id

      scope.where(project_id: @project_id)
    end
  end
end
