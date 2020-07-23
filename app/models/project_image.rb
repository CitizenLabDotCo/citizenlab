class ProjectImage < ApplicationRecord
  mount_base64_uploader :image, ProjectImageUploader
  belongs_to :project

  validates :project, presence: true
  validates :ordering, numericality: { only_integer: true }, allow_nil: true
end
