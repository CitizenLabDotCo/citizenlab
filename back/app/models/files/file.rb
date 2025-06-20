# frozen_string_literal: true

# == Schema Information
#
# Table name: files
#
#  id          :uuid             not null, primary key
#  name        :string
#  content     :string
#  uploader_id :uuid
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_files_on_uploader_id  (uploader_id)
#
# Foreign Keys
#
#  fk_rails_...  (uploader_id => users.id)
#
module Files
  class File < ApplicationRecord
    belongs_to :uploader, class_name: 'User'

    # TODO: Maybe reconsider the name of this column.
    # TODO: Using temporarily the ProjectFolders::FileUploader
    mount_base64_file_uploader :content, ::ProjectFolders::FileUploader

    validates :name, presence: true
    validates :content, presence: true
  end
end
