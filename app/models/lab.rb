class Lab < ApplicationRecord
  mount_uploader :images, LabImageUploader
  mount_uploader :files, LabFileUploader

  has_many :labs_topics, dependent: :destroy
  has_many :topics, through: :labs_topics
  has_many :areas_labs, dependent: :destroy
  has_many :areas, through: :areas_labs

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}

end
