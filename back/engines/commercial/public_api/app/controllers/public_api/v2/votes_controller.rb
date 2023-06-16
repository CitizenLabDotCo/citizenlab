# frozen_string_literal: true

module PublicApi
  class V2::VotesController < PublicApiController
    VOTABLE_TYPES = %w[idea initiative comment idea-comment initiative-comment]

    def index
      votes = PublicApi::VotesFinder.new(Vote.all, **finder_params).execute
      list_items(votes, V2::VoteSerializer)
    end

    private

    def finder_params
      params.dup.permit(:votable_type, :user_id).to_h.tap do |params|
        if (votable_type = params[:votable_type])
          validate_votable_type!(votable_type)

          # The finder expects classname-like values.
          params[:votable_type] = V2::BaseSerializer.type_to_classname(votable_type)
        end
      end.symbolize_keys
    end

    def validate_votable_type!(votable_type)
      return if VOTABLE_TYPES.include?(votable_type)

      raise InvalidEnumParameterValueError.new(
        'votable_type', votable_type, VOTABLE_TYPES
      )
    end
  end
end
