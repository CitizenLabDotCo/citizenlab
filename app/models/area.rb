class Area < ApplicationRecord
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, presence: true, multiloc: {presence: false}

  has_many :area_projects, dependent: :destroy
  has_many :projects, through: :area_projects
end
