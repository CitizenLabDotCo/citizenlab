class ProjectFolderImage < ApplicationRecord
  mount_base64_uploader :image, ProjectFolderImageUploader
  belongs_to :project_folder

  validates :project_folder, presence: true
  validates :ordering, numericality: { only_integer: true }, allow_nil: true
end
