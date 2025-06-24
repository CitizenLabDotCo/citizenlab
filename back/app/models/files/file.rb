# frozen_string_literal: true

# == Schema Information
#
# Table name: files
#
#  id                                          :uuid             not null, primary key
#  name                                        :string
#  content                                     :string
#  uploader_id(the user who uploaded the file) :uuid
#  created_at                                  :datetime         not null
#  updated_at                                  :datetime         not null
#  size(in bytes)                              :integer
#  mime_type                                   :string
#
# Indexes
#
#  index_files_on_size         (size)
#  index_files_on_uploader_id  (uploader_id)
#
# Foreign Keys
#
#  fk_rails_...  (uploader_id => users.id)
#
module Files
  class File < ApplicationRecord
    belongs_to :uploader, class_name: 'User', optional: true

    # TODO: Maybe reconsider the name of this column.
    # TODO: Using temporarily the ProjectFolders::FileUploader
    mount_base64_file_uploader :content, ::ProjectFolders::FileUploader

    validates :name, presence: true
    validates :content, presence: true
    validates :size, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

    before_save :update_metadata

    private

    def update_metadata
      return unless content.present? && content_changed?

      self.size = content.size
      self.mime_type = content.content_type
    end
  end
end
