# frozen_string_literal: true

class ReportBuilder::ReportPublisher
  def initialize(report)
    @report = report
  end

  def publish
    return unless @report.phase?

    ReportBuilder::PublishedGraphDataUnit.where(report_id: @report.id).destroy_all

    # TODO: change when we use multiple locales
    craftjs_json = @report.layout.craftjs_jsonmultiloc
    return if craftjs_json.blank?

    # TODO: change when we use multiple locales
    nodes = craftjs_json.values.first
    return if nodes.blank?

    nodes.each do |node_id, node_obj|
      type = node_obj['type']
      resolved_name = type.is_a?(Hash) ? type['resolvedName'] : next

      data = ReportBuilder::QueryRepository.new.data_by_graph(resolved_name, node_obj['props'])
      next unless data

      ReportBuilder::PublishedGraphDataUnit.create!(
        report_id: @report.id,
        graph_id: node_id,
        data: data
      )
    end
  end
end
