# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputsController < ApplicationController
        include FilterParamsExtraction
        skip_after_action :verify_policy_scoped, only: %i[index] # The analysis is authorized instead.
        before_action :set_analysis

        def index
          # index is not policy scoped, instead the analysis is authorized.
          @inputs = InputsFinder.new(@analysis, filters).execute
          filtered_count = @inputs.count
          @inputs = @inputs.order(published_at: :asc)
          @inputs = @inputs.includes(:author, :idea_files)
          @inputs = paginate @inputs

          render json: linked_json(
            @inputs,
            InputSerializer,
            params: {
              app_configuration: AppConfiguration.instance,
              view_private_attributes: view_private_attributes?,
              **jsonapi_serializer_params
            },
            include: %i[author idea_files],
            meta: {
              filtered_count: filtered_count
            }
          )
        end

        def show
          @input = @analysis.inputs.find(params[:id])
          render json: InputSerializer.new(
            @input,
            params: {
              app_configuration: AppConfiguration.instance,
              view_private_attributes: view_private_attributes?,
              **jsonapi_serializer_params
            },
            include: [:author]
          ).serializable_hash
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        # Whether to include private attributes in included authors (for native surveys).
        def view_private_attributes?
          return true unless @analysis.phase_id

          @analysis.phase.pmethod.supports_private_attributes_in_export?
        end
      end
    end
  end
end
