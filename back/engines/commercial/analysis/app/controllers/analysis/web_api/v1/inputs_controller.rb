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
          @inputs = @inputs.includes(:author)
          @inputs = paginate @inputs

          render json: linked_json(
            @inputs,
            InputSerializer,
            params: {
              app_configuration: AppConfiguration.instance,
              **jsonapi_serializer_params
            },
            include: [:author],
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
      end
    end
  end
end
