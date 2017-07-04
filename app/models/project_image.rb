class ProjectImage < ApplicationRecord
  mount_base64_uploader :image, ProjectImageUploader
  belongs_to :project

  validates :project, :image, presence: true
end
