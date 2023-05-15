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
  attr_accessor :filename

  mount_base64_file_uploader :file, ProjectFileUploader
  belongs_to :project

  validates :project, :name, presence: true
  validates :file, presence: true, unless: proc { Current.loading_tenant_template }
end
