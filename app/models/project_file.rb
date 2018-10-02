class ProjectFile < ApplicationRecord
	attr_accessor :filename
  mount_base64_uploader :file, ProjectFileUploader
  belongs_to :project

  validates :project, :file, :name, presence: true
end
