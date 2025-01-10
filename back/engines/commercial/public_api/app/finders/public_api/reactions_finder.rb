# frozen_string_literal: true

module PublicApi
  class ReactionsFinder
    REACTABLE_TYPES = %w[Idea Comment]

    def initialize(scope, reactable_type: nil, user_id: nil)
      @scope = scope
      @reactable_type = reactable_type
      @user_id = user_id
    end

    def execute
      @scope
        .where(reactable_type: REACTABLE_TYPES) # TODO: Can remove this when all initiative data has been removed from DB
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

      scope.where(reactable_type: @reactable_type)
    end
  end
end
