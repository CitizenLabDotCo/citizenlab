# frozen_string_literal: true

# == Schema Information
#
# Table name: project_files
#
#  id         :uuid             not null, primary key
#  project_id :uuid
#  file       :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#
# Indexes
#
#  index_project_files_on_project_id  (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#
class ProjectFile < ApplicationRecord
  EXTENSION_WHITELIST = %w[pdf doc docx pages odt xls xlsx numbers ods ppt pptx key odp txt csv mp3 mp4 avi mkv]

  attr_accessor :filename

  mount_base64_file_uploader :file, ProjectFileUploader
  belongs_to :project

  validates :project, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
  validate :extension_whitelist

  private

  def extension_whitelist
    return if EXTENSION_WHITELIST.include? name.split('.').last.downcase

    errors.add(
      :file,
      :extension_whitelist_error,
      message: 'Unsupported file extension'
    )
  end
end
