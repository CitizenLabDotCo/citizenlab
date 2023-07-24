# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputsController < ApplicationController
        skip_after_action :verify_policy_scoped, only: %i[index] # The analysis is authorized instead.
        before_action :set_analysis

        def index
          # index is not policy scoped, instead the analysis is authorized.
          @inputs = InputsFinder.new(@analysis, params).execute
          @inputs = paginate @inputs

          render json: linked_json(
            @inputs,
            InputSerializer,
            params: jsonapi_serializer_params,
            include: [:author]
          )
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
