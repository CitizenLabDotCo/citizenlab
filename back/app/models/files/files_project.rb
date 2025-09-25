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
#  index_files_projects_on_file_id                 (file_id) UNIQUE
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

    # The first specification for the file feature (360 Input) allowed files to be
    # associated with multiple projects. That's the reason why we opted for a join table
    # instead of a simple foreign key on the +files+ table. However, for the sake of
    # simplicity (in terms of permission logic and product behavior), we decided that
    # files should only belong to at most one project, at least for now.
    validates :file_id, uniqueness: true
  end
end
