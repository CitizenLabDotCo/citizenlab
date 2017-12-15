class Area < ApplicationRecord
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}

  has_and_belongs_to_many :projects
end
