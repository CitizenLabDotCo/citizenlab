class BasketsIdea < ApplicationRecord
  belongs_to :basket
  belongs_to :idea
  counter_culture :idea, 
    column_name: proc { |basket_idea|
      basket_idea.basket.submitted_at ? 'baskets_count' : nil
    },
    column_names: {
      ["baskets.submitted_at IS NOT NULL"] => "baskets_count"
    }

  validates :idea, :basket, presence: true
  validate :idea_with_budget


  private

  def idea_with_budget
  	if !idea.budget
  		errors.add(:idea, :has_no_budget, message: 'does not have a specified budget')
  	end
  end
end
