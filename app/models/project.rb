class Project < ApplicationRecord
  mount_uploader :images, ProjectImageUploader
  mount_uploader :files, ProjectFileUploader

  has_many :projects_topics, dependent: :destroy
  has_many :topics, through: :projects_topics
  has_many :areas_projects, dependent: :destroy
  has_many :areas, through: :areas_projects

  validates :title_multiloc, presence: true, multiloc: {presence: true}
  validates :description_multiloc, multiloc: {presence: false}

end
