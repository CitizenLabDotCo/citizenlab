# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class InputsController < ApplicationController
        skip_after_action :verify_policy_scoped, only: %i[index] # The analysis is authorized instead.
        before_action :set_analysis

        def index
          # index is not policy scoped, instead the analysis is authorized.
          @inputs = InputsFinder.new(@analysis, input_filter_params.to_h).execute
          @inputs = @inputs.order(published_at: :asc)
          @inputs = @inputs.includes(:author)
          @inputs = paginate @inputs

          render json: linked_json(
            @inputs,
            InputSerializer,
            params: jsonapi_serializer_params,
            include: [:author]
          )
        end

        def show
          @input = @analysis.inputs.find(params[:id])
          render json: InputSerializer.new(@input, params: jsonapi_serializer_params, include: [:author]).serializable_hash
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def input_filter_params
          permitted_dynamic_keys = []
          permitted_dynamic_array_keys = { tag_ids: [] }

          params.each_key do |key|
            if key.match?(/^author_custom_([a-f0-9-]+)_(from|to)$/)
              permitted_dynamic_keys << key
            elsif key.match?(/^author_custom_([a-f0-9-]+)$/)
              permitted_dynamic_array_keys[key] = []
            end
          end

          params.permit(
            :search,
            :published_at_from,
            :published_at_to,
            :reactions_from,
            :reactions_to,
            :votes_from,
            :votes_to,
            :comments_from,
            :comments_to,
            *permitted_dynamic_keys,
            **permitted_dynamic_array_keys
          )
        end
      end
    end
  end
end
