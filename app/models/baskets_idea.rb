class BasketsIdea < ApplicationRecord
  belongs_to :idea
  counter_culture :idea, column_name: 'baskets_count'
  belongs_to :basket

  validates :idea, :basket, presence: true
  validate :idea_with_budget


  private

  def idea_with_budget
  	if !idea.budget
  		errors.add(:idea, :has_no_budget, message: 'does not have a specified budget')
  	end
  end
end
