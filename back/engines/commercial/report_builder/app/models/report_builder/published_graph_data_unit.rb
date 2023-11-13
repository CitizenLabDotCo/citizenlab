# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_published_graph_data_units
#
#  id                       :uuid             not null, primary key
#  report_builder_report_id :uuid             not null
#  graph_id                 :string           not null
#  data                     :jsonb            not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  report_builder_published_data_units_report_id_idx  (report_builder_report_id)
#
# Foreign Keys
#
#  fk_rails_...  (report_builder_report_id => report_builder_reports.id)
#
module ReportBuilder
  class PublishedGraphDataUnit < ::ApplicationRecord
    # TODO: rename report_builder_report_id to report_id
    belongs_to :report, class_name: 'ReportBuilder::Report', foreign_key: 'report_builder_report_id'
  end
end
