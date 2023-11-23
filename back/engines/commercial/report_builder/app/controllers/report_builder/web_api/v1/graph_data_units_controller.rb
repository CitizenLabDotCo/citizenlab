# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class GraphDataUnitsController < ApplicationController
        def live
          authorize :live?, policy_class: GraphDataUnitPolicy
          results = ReportBuilder::QueryRepository.new.data_by_graph(params[:resolved_name], params[:props]&.permit! || {})
          render_results(results)
        end

        def published
          data_unit = PublishedGraphDataUnit.find_by!(report_id: params[:report_id], graph_id: params[:graph_id])
          authorize data_unit, policy_class: GraphDataUnitPolicy
          render_results(data_unit.data)
        end

        private

        def render_results(results)
          render json: {
            data: { type: 'report_builder_data_units', attributes: results },
            links: 'paginations'
          }
        end
      end
    end
  end
end
