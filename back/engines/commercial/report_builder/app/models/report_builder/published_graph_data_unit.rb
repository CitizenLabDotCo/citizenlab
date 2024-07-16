# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_published_graph_data_units
#
#  id         :uuid             not null, primary key
#  report_id  :uuid             not null
#  graph_id   :string           not null
#  data       :jsonb            not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  report_builder_published_data_units_report_id_idx  (report_id)
#
# Foreign Keys
#
#  fk_rails_...  (report_id => report_builder_reports.id)
#
module ReportBuilder
  class PublishedGraphDataUnit < ::ApplicationRecord
    belongs_to :report
  end
end
