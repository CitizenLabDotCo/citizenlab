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
#  index_files_on_mime_type    (mime_type)
#  index_files_on_size         (size)
#  index_files_on_uploader_id  (uploader_id)
#
# Foreign Keys
#
#  fk_rails_...  (uploader_id => users.id)
#
module Files
  class File < ApplicationRecord
    include PgSearch::Model

    belongs_to :uploader, class_name: 'User', optional: true

    has_many :files_projects, class_name: 'Files::FilesProject', dependent: :destroy
    has_many :projects, through: :files_projects

    # TODO: Maybe reconsider the name of this column.
    # TODO: Using temporarily the ProjectFolders::FileUploader
    mount_base64_file_uploader :content, ::ProjectFolders::FileUploader

    validates :name, presence: true
    validates :content, presence: true
    validates :size, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

    before_save :update_metadata

    pg_search_scope :search,
      against: [:name],
      using: %i[tsearch trigram],
      # For the ranking, trigram scores are only used to break ties between results that
      # have a tsearch score of 0. In other words, tsearch matches are always ranked
      # higher than trigram matches.
      ranked_by: 'CAST(:tsearch > 0 AS INTEGER) * (0.9 * :tsearch + 0.1) + 0.1 * :trigram'

    private

    def update_metadata
      return unless content.present? && content_changed?

      self.size = content.size
      self.mime_type = content.content_type
    end
  end
end
