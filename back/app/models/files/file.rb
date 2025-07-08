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

    # It is not meant to be used directly. See `search` scope below.
    pg_search_scope :_pg_search_only,
      against: [:name],
      using: %i[tsearch trigram],
      # For the ranking, trigram scores are only used to break ties between results that
      # have a tsearch score of 0. In other words, tsearch matches are always ranked
      # higher than trigram matches. (Both tsearch and trigram scores are in the range
      # [0, 1].)
      ranked_by: 'CAST(:tsearch > 0 AS INTEGER) * (0.9 * :tsearch + 0.1) + 0.1 * :trigram'

    # This scope complements the pg_search text search with results from an ILIKE query
    # (case-insensitive exact matches).
    #
    # +pg_search+ is optimized for longer documents and cannot be configured to return
    # some results we’d typically expect when searching for file names.  For example,
    # searching for one or two characters doesn't work well since it's too short for
    # trigram search, and tsearch only looks for exact matches in lexemes extracted from
    # the content. Additionally, neither tsearch nor trigram support searching for
    # numbers.
    scope :search, lambda { |query|
      return none if query.blank?

      exact_matches = where('name ILIKE ?', "%#{sanitize_sql_like(query)}%")
        .select('files.*, 1.0 AS pg_search_rank')

      pg_search_matches = _pg_search_only(query)
        .with_pg_search_rank
        .reorder(nil) # Remove the ordering to be able to union.

      all_matches = "(#{exact_matches.to_sql} UNION #{pg_search_matches.to_sql}) AS files"
      from(all_matches).select('files.*').order('pg_search_rank DESC')
    }

    private

    def update_metadata
      return unless content.present? && content_changed?

      self.size = content.size
      self.mime_type = content.content_type
    end
  end
end
