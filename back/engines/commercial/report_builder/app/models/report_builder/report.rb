# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_reports
#
#  id         :uuid             not null, primary key
#  name       :string
#  owner_id   :uuid             not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  phase_id   :uuid
#  visible    :boolean          default(FALSE), not null
#
# Indexes
#
#  index_report_builder_reports_on_name      (name) UNIQUE
#  index_report_builder_reports_on_owner_id  (owner_id)
#  index_report_builder_reports_on_phase_id  (phase_id)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#  fk_rails_...  (phase_id => phases.id)
#
module ReportBuilder
  class Report < ::ApplicationRecord
    belongs_to :owner, class_name: 'User'
    belongs_to :phase, class_name: 'Phase', optional: true

    has_one(
      :layout,
      class_name: 'ContentBuilder::Layout', as: :content_buildable,
      dependent: :destroy
    )

    has_many :published_graph_data_units, dependent: :destroy

    accepts_nested_attributes_for :layout

    scope :global, -> { where(phase_id: nil) }

    validates :name, uniqueness: true, allow_nil: true

    def phase?
      !phase_id.nil?
    end

    def public?
      phase? && phase.started? && visible?
    end
  end
end
