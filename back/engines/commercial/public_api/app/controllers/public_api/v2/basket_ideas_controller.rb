# frozen_string_literal: true

module PublicApi
  class V2::BasketIdeasController < PublicApiController
    include DeletedItemsAction

    def index
      list_items BasketsIdea.where(query_filters), V2::BasketIdeaSerializer
    end

    private

    def query_filters
      params.permit(:idea_id, :basket_id).to_h
    end
  end
end
