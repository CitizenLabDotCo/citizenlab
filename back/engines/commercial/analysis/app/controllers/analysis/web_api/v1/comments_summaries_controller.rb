# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class CommentsSummariesController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_input
        before_action :set_comments_summary, only: %i[show]

        def show
          render json: CommentsSummarySerializer.new(
            @comments_summary,
            params: jsonapi_serializer_params,
            include: [:background_task]
          ).serializable_hash
        end

        def create
          @comments_summary = find_comments_summary.first
          if @comments_summary && !@comments_summary.background_task&.finished?
            render json: { errors: { base: [{ error: :previous_task_not_yet_finished }] }, status: :unprocessable_entity }
            return
          end

          @comments_summary = CommentsSummary.new(
            background_task: CommentsSummarizationTask.new(analysis: @analysis),
            comments_ids: @input.comments.ids,
            idea: @input
          )

          if @comments_summary.save
            SideFxBackgroundTaskService.new.after_create(@comments_summary.background_task, current_user)
            side_fx_service.after_create(@comments_summary, current_user)
            CommentsSummarizationJob.perform_later(@comments_summary)
            render json: CommentsSummarySerializer.new(
              @comments_summary,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @comments_summary.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_input
          @input = @analysis.inputs.find(params[:input_id])
        end

        def set_comments_summary
          @comments_summary = find_comments_summary.first!
        end

        def find_comments_summary
          CommentsSummary
            .joins(:background_task)
            .where(background_task: { analysis: @analysis }, idea_id: @input.id)
            .order(created_at: :desc)
        end

        def side_fx_service
          @side_fx_service ||= SideFxCommentsSummaryService.new
        end
      end
    end
  end
end
