class BasketsIdea < ApplicationRecord
  belongs_to :idea
  counter_culture :idea, column_name: 'baskets_count'
  belongs_to :basket

  validates :idea, :basket, presence: true

  before_validation :set_added_at, on: :create


  def set_added_at
    self.added_at ||= Time.now
  end
end
