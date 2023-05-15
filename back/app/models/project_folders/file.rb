# frozen_string_literal: true

# == Schema Information
#
# Table name: project_folders_files
#
#  id                :uuid             not null, primary key
#  project_folder_id :uuid
#  file              :string
#  name              :string
#  ordering          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_project_folders_files_on_project_folder_id  (project_folder_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_folder_id => project_folders_folders.id)
#
module ProjectFolders
  class File < ::ApplicationRecord
    self.table_name = 'project_folders_files'

    attr_accessor :filename

    mount_base64_file_uploader :file, FileUploader
    belongs_to :project_folder, class_name: 'Folder' # TODO: rename to :folder

    validates :project_folder, :name, presence: true
    validates :file, presence: true, unless: proc { Current.loading_tenant_template }
  end
end
