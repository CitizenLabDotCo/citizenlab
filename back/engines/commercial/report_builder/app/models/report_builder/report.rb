# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id            :uuid             not null, primary key
#  name          :string
#  owner_id      :uuid
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  phase_id      :uuid
#  visible       :boolean          default(FALSE), not null
#  name_tsvector :tsvector
#  year          :integer
#  quarter       :integer
#
# Indexes
#
#  index_report_builder_reports_on_name           (name) UNIQUE
#  index_report_builder_reports_on_name_tsvector  (name_tsvector) USING gin
#  index_report_builder_reports_on_owner_id       (owner_id)
#  index_report_builder_reports_on_phase_id       (phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#  fk_rails_...  (phase_id => phases.id)
#
module ReportBuilder
  class Report < ::ApplicationRecord
    include PgSearch::Model

    belongs_to :owner, class_name: 'User', optional: true
    belongs_to :phase, class_name: 'Phase', optional: true
    has_many :published_graph_data_units, dependent: :destroy

    has_one(
      :layout,
      class_name: 'ContentBuilder::Layout', as: :content_buildable,
      dependent: :destroy
    )

    accepts_nested_attributes_for :layout

    scope :global, -> { where(phase_id: nil) }
    pg_search_scope :search_name, against: :name_tsvector, using: {
      tsearch: { tsvector_column: 'name_tsvector', prefix: true }
    }

    validates :name, uniqueness: true, allow_nil: true
    validates :phase_id, uniqueness: true, unless: :supports_multiple_phase_reports?, allow_nil: true
    validates :visible, inclusion: { in: [false], unless: :phase? }
    validates :year, numericality: { in: 2024..2050 }, allow_nil: true
    validates :quarter, numericality: { in: 1..4 }, allow_nil: true

    def phase?
      !phase_id.nil?
    end

    def public?
      phase? && phase.started? && visible?
    end

    private

    def supports_multiple_phase_reports?
      phase&.pmethod&.supports_multiple_phase_reports?
    end
  end
end
