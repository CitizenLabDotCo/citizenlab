class AreasIdea < ApplicationRecord
  belongs_to :idea
  belongs_to :area

  validates :idea, :area, presence: true
end
