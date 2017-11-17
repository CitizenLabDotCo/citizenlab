class ProjectFile < ApplicationRecord
  mount_base64_uploader :file, ProjectFileUploader
  belongs_to :project

  validates :project, :file, presence: true
end
