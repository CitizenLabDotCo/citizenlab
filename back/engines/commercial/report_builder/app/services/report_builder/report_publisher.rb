# frozen_string_literal: true

class ReportBuilder::ReportPublisher
  def initialize(report, current_user)
    @report = report
    @current_user = current_user
  end

  def publish
    return unless @report.phase?

    ReportBuilder::PublishedGraphDataUnit.transaction do
      ReportBuilder::PublishedGraphDataUnit.where(report_id: @report.id).destroy_all

      nodes = @report.layout.craftjs_json
      next if nodes.blank?

      nodes.each do |node_id, node_obj|
        type = node_obj['type']
        resolved_name = type.is_a?(Hash) ? type['resolvedName'] : next

        data = ReportBuilder::QueryRepository.new(@current_user).data_by_graph(resolved_name, node_obj['props'])
        next unless data

        ReportBuilder::PublishedGraphDataUnit.create!(
          report_id: @report.id,
          graph_id: node_id,
          data: data
        )
      end
    end
  end
end
