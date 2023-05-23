# frozen_string_literal: true

# == Schema Information
#
# Table name: idea_files
#
#  id         :uuid             not null, primary key
#  idea_id    :uuid
#  file       :string
#  ordering   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  name       :string
#
# Indexes
#
#  index_idea_files_on_idea_id  (idea_id)
#
# Foreign Keys
#
#  fk_rails_...  (idea_id => ideas.id)
#
class FileUpload < IdeaFile
  mount_base64_file_uploader :file, FileUploadUploader
end
