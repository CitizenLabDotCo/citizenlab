# frozen_string_literal: true

# == Schema Information
#
# Table name: baskets_ideas
#
#  id         :uuid             not null, primary key
#  basket_id  :uuid
#  idea_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  votes      :integer          default(1), not null
#
# Indexes
#
#  index_baskets_ideas_on_basket_id_and_idea_id  (basket_id,idea_id) UNIQUE
#  index_baskets_ideas_on_idea_id                (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class BasketsIdea < ApplicationRecord
  belongs_to :basket
  belongs_to :idea

  before_validation :assign_by_voting_method

  validates :idea, :basket, presence: true
  validates :idea_id, uniqueness: { scope: :basket_id }
  validate :validate_by_voting_method
  validates :votes, numericality: { only_integer: true, greater_than: 0 }

  private

  def assign_by_voting_method
    Factory.instance.voting_method_for(basket.participation_context).assign_baskets_idea self
  end

  def validate_by_voting_method
    Factory.instance.voting_method_for(basket.participation_context).validate_baskets_idea(self)
  end
end
