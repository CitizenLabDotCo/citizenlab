# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id                :uuid             not null, primary key
#  name              :string
#  owner_id          :uuid
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  phase_id          :uuid
#  visible           :boolean          default(FALSE), not null
#  name_tsvector     :tsvector
#  year              :integer
#  quarter           :integer
#  community_monitor :boolean          default(FALSE), not null
#  project_id        :uuid
#
# Indexes
#
#  index_report_builder_reports_on_name           (name) UNIQUE
#  index_report_builder_reports_on_name_tsvector  (name_tsvector) USING gin
#  index_report_builder_reports_on_owner_id       (owner_id)
#  index_report_builder_reports_on_phase_id       (phase_id)
#  index_report_builder_reports_on_project_id     (project_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#  fk_rails_...  (phase_id => phases.id)
#  fk_rails_...  (project_id => projects.id)
#
module ReportBuilder
  class Report < ::ApplicationRecord
    include PgSearch::Model

    belongs_to :owner, class_name: 'User', optional: true
    belongs_to :phase, class_name: 'Phase', optional: true
    # A report is about a phase or about a whole project, never both.
    belongs_to :project, optional: true
    has_many :published_graph_data_units, dependent: :destroy
    has_one :chat, class_name: 'ReportBuilder::ReportChat', dependent: :destroy, inverse_of: :report
    has_many :generation_transcripts, class_name: 'ReportBuilder::GenerationTranscript',
      dependent: :destroy, inverse_of: :report

    # The "your report is ready" notification points at the report, so deleting one
    # would otherwise be refused by the foreign key. Nullifying is tried first and
    # fails — ReportGenerated validates the report's presence — which leaves the
    # notification to be destroyed along with the report it was about.
    # before_destroy must be declared above the association: rails/rails#5205.
    before_destroy :remove_notifications
    has_many :notifications, class_name: '::Notification', dependent: :nullify

    has_one(
      :layout,
      class_name: 'ContentBuilder::Layout', as: :content_buildable,
      dependent: :destroy
    )

    accepts_nested_attributes_for :layout

    scope :global, -> { where(phase_id: nil) }

    # How long an unfinished run is believed to be still running. Past that the
    # report is listed again even with the tracker open, so a worker that died
    # without completing its tracker cannot hide a report for good.
    GENERATION_ASSUMED_STALE_AFTER = 1.hour

    # A report about a whole project is created as an empty shell the moment an
    # admin asks for one, and the composer only fills it minutes later. Listing
    # the shell offers a report that opens onto nothing, so it waits out the run.
    #
    # It is listed again the moment the run is over, with or without content: a run
    # that failed leaves a report the admin still has to be able to open, generate
    # again or delete, and a report nobody can see is a report nobody can delete.
    scope :listable, lambda {
      where(
        <<~SQL.squish,
          report_builder_reports.project_id IS NULL
          OR EXISTS (
            SELECT 1 FROM content_builder_layouts
            WHERE content_builder_layouts.content_buildable_type = 'ReportBuilder::Report'
              AND content_builder_layouts.content_buildable_id = report_builder_reports.id
              AND content_builder_layouts.craftjs_json <> '{}'::jsonb
          )
          OR NOT EXISTS (
            SELECT 1 FROM jobs_trackers
            WHERE jobs_trackers.root_job_type = :job
              AND jobs_trackers.completed_at IS NULL
              AND jobs_trackers.created_at > :since
              AND jobs_trackers.context_type = 'Project'
              AND jobs_trackers.context_id = report_builder_reports.project_id
          )
        SQL
        job: ReportBuilder::GenerateReportJob.name,
        since: GENERATION_ASSUMED_STALE_AFTER.ago
      )
    }
    pg_search_scope :search_name, against: :name_tsvector, using: {
      tsearch: { tsvector_column: 'name_tsvector', prefix: true }
    }

    validates :name, uniqueness: true, allow_nil: true
    validates :phase_id, uniqueness: true, unless: :supports_multiple_phase_reports?, allow_nil: true
    validates :project_id, uniqueness: true, allow_nil: true
    validates :project_id, absence: true, if: :phase?
    validates :visible, inclusion: { in: [false], unless: :phase? }
    validates :year, numericality: { in: 2024..2050 }, allow_nil: true
    validates :quarter, numericality: { in: 1..4 }, allow_nil: true

    def phase?
      !phase_id.nil?
    end

    # The project the report is about, whether it is scoped to the whole project or
    # to one of its phases.
    def reported_project
      project || phase&.project
    end

    # The run that wrote what the report holds now, if a model wrote it.
    def last_generation
      generation_transcripts.generations.finished.newest_first.first
    end

    def public?
      phase? && phase.started? && visible?
    end

    private

    def remove_notifications
      notifications.each do |notification|
        notification.destroy! unless notification.update(report: nil)
      end
    end

    def supports_multiple_phase_reports?
      phase&.pmethod&.supports_multiple_phase_reports?
    end
  end
end
