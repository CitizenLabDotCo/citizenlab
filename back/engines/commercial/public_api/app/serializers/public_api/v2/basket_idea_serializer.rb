# frozen_string_literal: true

module PublicApi
  module V2
    class BasketIdeaSerializer < PublicApi::V2::BaseSerializer
      type :basket_ideas
      attributes(:id, :basket_id, :idea_id, :votes, :created_at, :updated_at)

      attribute(:phase_id) { object.basket.phase_id }
      attribute(:project_id) { object.basket.phase&.project_id }
      attribute(:user_id) { object.basket.user_id }
    end
  end
end
