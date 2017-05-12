class ProjectsTopic < ApplicationRecord
  belongs_to :project
  belongs_to :topic

  validates :project, :topic, presence: true
end
