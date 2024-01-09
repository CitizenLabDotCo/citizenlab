# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class GraphDataUnitsController < ApplicationController
        skip_before_action :authenticate_user, only: :published

        def live
          props = params[:props]&.permit! || {}
          authorize props, policy_class: LiveGraphDataUnitPolicy
          results = ReportBuilder::QueryRepository.new(current_user).data_by_graph(params[:resolved_name], props)
          render_results(results)
        end

        def published
          data_unit = PublishedGraphDataUnit.find_by!(report_id: params[:report_id], graph_id: params[:graph_id])
          authorize data_unit, policy_class: PublishedGraphDataUnitPolicy
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
