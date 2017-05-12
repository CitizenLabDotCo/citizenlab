class AreasProject < ApplicationRecord
  belongs_to :project
  belongs_to :area

  validates :project, :area, presence: true
end
