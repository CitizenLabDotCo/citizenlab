# frozen_string_literal: true

# == Schema Information
#
# Table name: files_projects
#
#  id         :uuid             not null, primary key
#  file_id    :uuid             not null
#  project_id :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_files_projects_on_file_id                 (file_id)
#  index_files_projects_on_file_id_and_project_id  (file_id,project_id) UNIQUE
#  index_files_projects_on_project_id              (project_id)
#
# Foreign Keys
#
#  fk_rails_...  (file_id => files.id)
#  fk_rails_...  (project_id => projects.id)
#
module Files
  class FilesProject < ApplicationRecord
    belongs_to :file, class_name: 'Files::File', inverse_of: :files_projects
    belongs_to :project, inverse_of: :files_projects

    validates :file_id, uniqueness: { scope: :project_id }
  end
end
