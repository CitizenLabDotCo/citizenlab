class BasketsIdea < ApplicationRecord
  belongs_to :idea
  belongs_to :basket

  validates :idea, :basket, presence: true

  before_validation :set_added_at, on: :create


  def set_added_at
    self.added_at ||= Time.now
  end
end
