# frozen_string_literal: true

module PublicApi
  class V2::VotesController < PublicApiController
    def for_ideas
      list_items Vote.where(votable_type: 'Idea'), V2::IdeaVoteSerializer
    end

    def for_initiatives
      list_items Vote.where(votable_type: 'Initiative'), V2::IdeaVoteSerializer
    end

    # TODO: How do we know if the comments are for ideas / initiatives?
    def for_idea_comments
      list_items Vote.where(votable_type: 'Comment'), V2::IdeaCommentVoteSerializer
    end

    def for_initiative_comments
      list_items Vote.where(votable_type: 'Comment'), V2::IdeaCommentVoteSerializer
    end

  end
end
