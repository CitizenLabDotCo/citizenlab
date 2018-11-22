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
