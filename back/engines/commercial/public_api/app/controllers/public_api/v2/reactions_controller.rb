# frozen_string_literal: true

module PublicApi
  class V2::ReactionsController < PublicApiController
    REACTABLE_TYPES = %w[idea initiative comment idea-comment initiative-comment]

    def index
      reactions = PublicApi::ReactionsFinder.new(Reaction.all, **finder_params).execute
      list_items(reactions, V2::ReactionSerializer)
    end

    private

    def finder_params
      params.dup.permit(:reactable_type, :user_id).to_h.tap do |params|
        if params[:reactable_type]
          validate_reactable_type!(params[:reactable_type])
          params[:reactable_type] = params[:reactable_type].snakecase.classify
        end
      end.symbolize_keys
    end

    def validate_reactable_type!(reactable_type)
      return if REACTABLE_TYPES.include?(reactable_type)

      raise InvalidEnumParameterValueError.new(
        'reactable_type', reactable_type, REACTABLE_TYPES
      )
    end
  end
end
