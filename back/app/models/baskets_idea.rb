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
#  deleted_at :datetime
#
# Indexes
#
#  index_baskets_ideas_on_basket_id_and_idea_id  (basket_id,idea_id) UNIQUE WHERE (deleted_at IS NULL)
#  index_baskets_ideas_on_deleted_at             (deleted_at)
#  index_baskets_ideas_on_idea_id                (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class BasketsIdea < ApplicationRecord
  acts_as_paranoid
  belongs_to :basket
  belongs_to :idea

  before_validation :assign_by_voting_method

  validates :idea, :basket, presence: true
  validates :idea_id, uniqueness: { scope: :basket_id, conditions: -> { where(deleted_at: nil) } }
  validate :validate_by_voting_method
  validates :votes, numericality: { only_integer: true, greater_than: 0 }

  private

  def assign_by_voting_method
    Factory.instance.voting_method_for(basket.phase).assign_baskets_idea self
  end

  def validate_by_voting_method
    Factory.instance.voting_method_for(basket.phase).validate_baskets_idea(self)
  end
end
