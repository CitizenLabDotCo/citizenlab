# == Schema Information
#
# Table name: baskets_ideas
#
#  id         :uuid             not null, primary key
#  basket_id  :uuid
#  idea_id    :uuid
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_baskets_ideas_on_basket_id  (basket_id)
#  index_baskets_ideas_on_idea_id    (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (basket_id => baskets.id)
#  fk_rails_...  (idea_id => ideas.id)
#
class BasketsIdea < ApplicationRecord
  belongs_to :basket
  belongs_to :idea

  validates :idea, :basket, presence: true
  validate :idea_with_budget


  private

  def idea_with_budget
  	if !idea.budget
  		errors.add(:idea, :has_no_budget, message: 'does not have a specified budget')
  	end
  end
end
