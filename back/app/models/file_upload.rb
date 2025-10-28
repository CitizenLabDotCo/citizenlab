# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_files
#
#  id                                                                                     :uuid             not null, primary key
#  idea_id                                                                                :uuid
#  file                                                                                   :string
#  ordering                                                                               :integer
#  created_at                                                                             :datetime         not null
#  updated_at                                                                             :datetime         not null
#  name                                                                                   :string
#  migrated_file_id(References the Files::File record after migration to new file system) :uuid
#  migration_skipped_reason                                                               :string
#
# Indexes
#
#  index_idea_files_on_idea_id           (idea_id)
#  index_idea_files_on_migrated_file_id  (migrated_file_id)
#
# Foreign Keys
#
#  fk_rails_...  (migrated_file_id => files.id)
#
class FileUpload < IdeaFile
  mount_base64_file_uploader :file, FileUploadUploader
end
