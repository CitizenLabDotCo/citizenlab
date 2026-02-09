# frozen_string_literal: true

# == Schema Information
#
# Table name: files
#
#  id                                                                           :uuid             not null, primary key
#  name                                                                         :string
#  content                                                                      :string
#  uploader_id(the user who uploaded the file)                                  :uuid
#  created_at                                                                   :datetime         not null
#  updated_at                                                                   :datetime         not null
#  size(in bytes)                                                               :integer
#  mime_type                                                                    :string
#  category                                                                     :string           default("other"), not null
#  description_multiloc                                                         :jsonb
#  tsvector                                                                     :tsvector
#  ai_processing_allowed(whether consent was given to process the file with AI) :boolean          default(FALSE), not null
#
# Indexes
#
#  index_files_on_category                                (category)
#  index_files_on_description_multiloc_text_gin_trgm_ops  (((description_multiloc)::text) gin_trgm_ops) USING gin
#  index_files_on_mime_type                               (mime_type)
#  index_files_on_name_gin_trgm                           (name) USING gin
#  index_files_on_size                                    (size)
#  index_files_on_tsvector                                (tsvector) USING gin
#  index_files_on_uploader_id                             (uploader_id)
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

    attribute :ai_processing_allowed, :boolean, default: false

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

    before_save :update_metadata

    # This callback is used to break the circular destroy dependency between the +File+
    # and +FileAttachment+ models (and more specifically with the
    # +FileAttachment#destroy_orphaned_file+ callback). It needs to be defined before the
    # associations with +dependent: :destroy+ for associated records to be able to check
    # whether the file is being destroyed.
    around_destroy :mark_as_being_destroyed

    has_many :attachments, class_name: 'Files::FileAttachment', inverse_of: :file, dependent: :destroy
    has_many :files_projects, class_name: 'Files::FilesProject', dependent: :destroy
    has_many :projects, through: :files_projects
    has_one :preview, class_name: 'Files::Preview', dependent: :destroy, inverse_of: :file
    has_one :transcript, class_name: 'Files::Transcript', dependent: :destroy, inverse_of: :file

    has_one :project_folders_file, class_name: 'ProjectFolders::File', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy
    has_one :event_file, class_name: 'EventFile', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy
    has_one :idea_file, class_name: 'IdeaFile', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy
    has_one :phase_file, class_name: 'PhaseFile', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy
    has_one :project_file, class_name: 'ProjectFile', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy
    has_one :static_page_file, class_name: 'StaticPageFile', foreign_key: 'migrated_file_id', inverse_of: 'migrated_file', dependent: :destroy

    has_one(
      :desc_generation_job,
      -> { where(root_job_type: 'Files::DescriptionGenerationJob') },
      class_name: 'Jobs::Tracker',
      as: :context,
      inverse_of: :context,
      dependent: :destroy
    )

    mount_base64_file_uploader :content, FileUploader

    validates :name, presence: true
    validates :content, presence: true
    validates :size, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
    validates :description_multiloc, multiloc: { presence: false }
    validates :ai_processing_allowed, inclusion: { in: [true, false] }

    # It is not meant to be used directly. See `search` scope below.
    pg_search_scope :_pg_search_only,
      against: %i[name description_multiloc],
      using: {
        # tsearch completely ignores the :against option bc a pre-computed tsvector is used
        # (The tsvector type represents a document in a form optimized for text search.)
        tsearch: { tsvector_column: 'tsvector' },
        # TODO: Trigram search is currently performed directly on the JSONB column
        #   (description_multiloc), which isn't ideal, as converting it to text also
        #   includes the keys. Research: Consider extracting descriptions into a separate
        #   model with (locale, text) columns instead.
        trigram: {}
      },
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

    def description_generation_status
      status = desc_generation_job&.status

      # TODO: Improve the tracker interface to make this simpler.
      if status == :completed
        desc_generation_job.error_count.positive? ? :failed : :completed
      else
        status
      end
    end

    def being_destroyed?
      !!@being_destroyed
    end

    def image?
      content.content_type.start_with?('image/')
    end

    def text?
      content.content_type.start_with?('text/')
    end

    private

    def mark_as_being_destroyed
      @being_destroyed = true
      yield
    ensure
      @being_destroyed = false
    end

    def update_metadata
      return unless content.present? && content_changed?

      self.size = content.size
      self.mime_type = content.content_type
    end
  end
end
