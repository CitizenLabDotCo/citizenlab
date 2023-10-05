# frozen_string_literal: true

module PublicApi
  module V2
    class BasketIdeaSerializer < PublicApi::V2::BaseSerializer
      type :basket_ideas
      attributes(:basket_id, :idea_id, :votes, :created_at, :updated_at)
    end
  end
end
