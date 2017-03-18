class Area < ApplicationRecord
  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, presence: true, multiloc: {presence: false}

  has_many :area_labs, dependent: :destroy
  has_many :labs, through: :area_labs
end
