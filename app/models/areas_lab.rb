class AreasLab < ApplicationRecord
  belongs_to :lab
  belongs_to :area

  validates :lab, :area, presence: true
end
