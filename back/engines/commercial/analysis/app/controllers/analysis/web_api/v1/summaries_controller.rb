# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class SummariesController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_summary, only: [:destroy]

        def index
          summaries = @analysis.summaries
            .order(created_at: :asc)
            .includes(:background_task)
          render json: WebApi::V1::SummarySerializer.new(
            summaries,
            params: jsonapi_serializer_params,
            include: [:background_task]
          ).serializable_hash
        end

        def create
          @summary = Summary.new(
            analysis: @analysis,
            summarization_method: 'bogus',
            background_task: SummarizationTask.new(analysis: @analysis),
            **summary_params
          )
          if @summary.save
            side_fx_service.after_create(@summary, current_user)
            SummarizationJob.perform_later(@summary.background_task)
            render json: WebApi::V1::SummarySerializer.new(
              @summary,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @summary.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          if @summary.destroy
            side_fx_service.after_destroy(@summary, current_user)
            head :ok
          else
            render json: { errors: @summary.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_summary
          @summary = @analysis.summaries.find(params[:id])
        end

        def summary_params
          permitted_dynamic_filter_keys = []
          permitted_dynamic_filter_array_keys = { tag_ids: [] }

          params[:summary][:filters].each_key do |key|
            if key.match?(/^author_custom_([a-f0-9-]+)_(from|to)$/)
              permitted_dynamic_filter_keys << key
            elsif key.match?(/^author_custom_([a-f0-9-]+)$/)
              permitted_dynamic_filter_array_keys[key] = []
            end
          end

          params.require(:summary).permit(filters: [
            :search,
            :published_at_from,
            :published_at_to,
            :reactions_from,
            :reactions_to,
            :votes_from,
            :votes_to,
            :comments_from,
            :comments_to,
            *permitted_dynamic_filter_keys,
            **permitted_dynamic_filter_array_keys
          ])
        end

        def side_fx_service
          @side_fx_service ||= SideFxSummaryService.new
        end
      end
    end
  end
end
