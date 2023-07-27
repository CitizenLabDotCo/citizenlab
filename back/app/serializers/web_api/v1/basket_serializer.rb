# frozen_string_literal: true

class WebApi::V1::BasketSerializer < WebApi::V1::BaseSerializer
  attributes :submitted_at, :total_votes

  belongs_to :participation_context, polymorphic: true
  belongs_to :user

  has_many :ideas do |object|
    object.ideas.order('baskets_ideas.created_at DESC')
  end
  has_many :baskets_ideas
end
