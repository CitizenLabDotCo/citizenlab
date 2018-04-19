class Area < ApplicationRecord
  has_many :projects, through: :areas_projects
  has_many :areas_projects, dependent: :destroy
  has_many :ideas, through: :areas_ideas
  has_many :areas_ideas, dependent: :destroy

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}
end
