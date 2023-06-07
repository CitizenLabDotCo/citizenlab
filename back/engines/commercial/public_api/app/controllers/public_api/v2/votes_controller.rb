# frozen_string_literal: true

module PublicApi
  class V2::VotesController < PublicApiController
    def for_ideas
      list_items Vote.where(votable_type: 'Idea'), V2::VoteSerializer
    end

    def for_initiatives
      list_items Vote.where(votable_type: 'Initiative'), V2::VoteSerializer
    end

    # TODO: How do we know if the vote comments are for ideas / initiatives?
    def for_idea_comments
      list_items Vote.where(votable_type: 'Comment'), V2::VoteSerializer
    end

    def for_initiative_comments
      list_items Vote.where(votable_type: 'Comment'), V2::VoteSerializer
    end
  end
end
