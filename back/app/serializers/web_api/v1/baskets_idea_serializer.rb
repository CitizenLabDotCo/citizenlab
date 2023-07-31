# frozen_string_literal: true

class WebApi::V1::BasketsIdeaSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :votes

  belongs_to :basket
  belongs_to :idea
end
