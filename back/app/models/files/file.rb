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
#  category                                    :string           default("other"), not null
#
# Indexes
#
#  index_files_on_category       (category)
#  index_files_on_mime_type      (mime_type)
#  index_files_on_name_gin_trgm  (name) USING gin
#  index_files_on_size           (size)
#  index_files_on_uploader_id    (uploader_id)
#
# Foreign Keys
#
#  fk_rails_...  (uploader_id => users.id)
#
module Files
  # The Files::File model represents uploaded files in the system.
  #
  # = File categories
  #
  # This model implements a semantic typology for files through the +category+ attribute,
  # allowing users to categorize files based on their content type or purpose.
  #
  #   file = Files::File.new(..., category: :meeting)
  #   file.meeting?     # => true
  #   file.category     # => 'meeting'
  #
  # == Available Categories
  #
  # [+meeting+]
  #   The summary or minutes from an in-person meeting.
  #
  # [+interview+]
  #   The summary or notes from a 1-on-1 interview.
  #
  # [+strategic_plan+]
  #   An informational document that outlines how a project will achieve its goals
  #   and objectives. These files typically include project roadmaps, implementation
  #   strategies, resource allocation plans, timelines, and long-term vision statements.
  #
  # [+info_sheet+]
  #   An informational document to give more context about a topic, project, or process.
  #   These files serve as reference materials, fact sheets, or explanatory documents
  #   that provide background information and additional details.
  #
  # [+policy+]
  #   An official document with a policy proposal or established guidelines. These files
  #   contain formal policies, regulations, procedures, or proposed changes to existing
  #   governance structures and operational frameworks.
  #
  # [+report+]
  #   A general writeup to share results or summarize a process.
  #
  # [+other+]
  #   A catch-all category for files that don't fit into the specific categories above.
  #
  class File < ApplicationRecord
    include PgSearch::Model

    enum :category, {
      meeting: 'meeting',
      interview: 'interview',
      strategic_plan: 'strategic_plan',
      info_sheet: 'info_sheet',
      policy: 'policy',
      report: 'report',
      other: 'other'
    }, default: :other, validate: true

    belongs_to :uploader, class_name: 'User', optional: true

    has_many :files_projects, class_name: 'Files::FilesProject', dependent: :destroy
    has_many :projects, through: :files_projects

    # TODO: Maybe reconsider the name of this column.
    mount_base64_file_uploader :content, FileUploader

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
    # numbers or special characters.
    scope :search, lambda { |query|
      return none if query.blank?

      exact_matches = where('name ILIKE ?', "%#{sanitize_sql_like(query)}%")
        # Exact matches are ranked higher than pg_search matches.
        .select('files.*, 1.0 AS pg_search_rank')

      pg_search_matches = _pg_search_only(query)
        .where.not(id: exact_matches.reselect(:id))
        .with_pg_search_rank
        .reorder(nil) # Remove the ordering to be able to union.

      all_matches = "(#{exact_matches.to_sql} UNION #{pg_search_matches.to_sql}) AS files"
      from(all_matches).order('pg_search_rank DESC')
    }

    private

    def update_metadata
      return unless content.present? && content_changed?

      self.size = content.size
      self.mime_type = content.content_type
    end
  end
end
