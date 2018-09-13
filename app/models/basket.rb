class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true
  
  has_many :baskets_ideas, dependent: :destroy
  has_many :ideas, through: :baskets_ideas
end
