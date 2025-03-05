# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class HeatmapCellsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def index
          heatmap_cells = @analysis.heatmap_cells
          render json: WebApi::V1::HeatmapCellSerializer.new(
            heatmap_cells,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end
      end
    end
  end
end
