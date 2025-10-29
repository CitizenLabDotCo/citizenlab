# frozen_string_literal: true

# == Schema Information
#
# Table name: project_folders_files
#
#  id                                                                                     :uuid             not null, primary key
#  project_folder_id                                                                      :uuid
#  file                                                                                   :string
#  name                                                                                   :string
#  ordering                                                                               :integer
#  created_at                                                                             :datetime         not null
#  updated_at                                                                             :datetime         not null
#  migrated_file_id(References the Files::File record after migration to new file system) :uuid
#  migration_skipped_reason                                                               :string
#
# Indexes
#
#  index_project_folders_files_on_migrated_file_id   (migrated_file_id)
#  index_project_folders_files_on_project_folder_id  (project_folder_id)
#
# Foreign Keys
#
#  fk_rails_...  (migrated_file_id => files.id)
#
module ProjectFolders
  class File < ::ApplicationRecord
    include FileMigratable

    self.table_name = 'project_folders_files'

    attr_accessor :filename

    mount_base64_file_uploader :file, FileUploader
    belongs_to :project_folder, class_name: 'Folder' # TODO: rename to :folder

    validates :project_folder, :name, presence: true
    validates :file, presence: true, unless: proc { Current.loading_tenant_template }
  end
end
