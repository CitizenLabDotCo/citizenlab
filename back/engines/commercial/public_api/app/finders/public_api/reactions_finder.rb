# frozen_string_literal: true

module PublicApi
  class ReactionsFinder
    REACTABLE_TYPES = %w[Idea Comment IdeaComment]

    def initialize(scope, reactable_type: nil, user_id: nil)
      @scope = scope
      @reactable_type = reactable_type
      @user_id = user_id
    end

    def execute
      @scope
        .then { |scope| filter_by_user_id(scope) }
        .then { |scope| filter_by_reactable_type(scope) }
    end

    private

    def filter_by_user_id(scope)
      return scope unless @user_id

      scope.where(user_id: @user_id)
    end

    def filter_by_reactable_type(scope)
      return scope unless @reactable_type

      if REACTABLE_TYPES.exclude?(@reactable_type)
        raise ArgumentError, "Invalid reactable_type: '#{@reactable_type}'."
      end

      case @reactable_type
      when 'IdeaComment'
        scope.where(reactable: Comment.where(post_type: 'Idea'))
      else
        scope.where(reactable_type: @reactable_type)
      end
    end
  end
end
