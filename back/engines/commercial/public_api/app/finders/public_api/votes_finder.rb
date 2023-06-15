# frozen_string_literal: true

module PublicApi
  class VotesFinder
    VOTABLE_TYPES = %w[Idea Initiative Comment IdeaComment InitiativeComment]

    def initialize(scope, votable_type: nil, user_id: nil)
      @scope = scope
      @votable_type = votable_type
      @user_id = user_id
    end

    def execute
      @scope
        .then { |scope| filter_by_user_id(scope) }
        .then { |scope| filter_by_votable_type(scope) }
    end

    private

    def filter_by_user_id(scope)
      return scope unless @user_id

      scope.where(user_id: @user_id)
    end

    def filter_by_votable_type(scope)
      return scope unless @votable_type

      if VOTABLE_TYPES.exclude?(@votable_type)
        raise ArgumentError, "Invalid votable_type: '#{@votable_type}'."
      end

      case @votable_type
      when 'IdeaComment'
        scope.where(votable: Comment.where(post_type: 'Idea'))
      when 'InitiativeComment'
        scope.where(votable: Comment.where(post_type: 'Initiative'))
      else
        scope.where(votable_type: @votable_type)
      end
    end
  end
end
