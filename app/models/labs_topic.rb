class LabsTopic < ApplicationRecord
  belongs_to :lab
  belongs_to :topic

  validates :lab, :topic, presence: true
end
