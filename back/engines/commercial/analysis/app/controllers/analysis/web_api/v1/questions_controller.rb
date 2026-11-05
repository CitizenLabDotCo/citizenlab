# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class QuestionsController < ApplicationController
        include FilterParamsExtraction

        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_question, only: %i[show regenerate]

        def show
          render json: QuestionSerializer.new(@question, params: jsonapi_serializer_params).serializable_hash
        end

        # Used to check whether a question is possible with the given filters,
        # front-end should call this before initiating the question
        def pre_check
          @question = Question.new(
            background_task: QAndATask.new(analysis: @analysis),
            **question_params,
            insight_attributes: insight_attributes
          )
          plan = QAndAMethod::Base.plan(@question)
          render json: QuestionPreCheckSerializer.new(
            plan,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          @question = Question.new(
            background_task: QAndATask.new(analysis: @analysis),
            **question_params,
            insight_attributes: insight_attributes
          )

          file_ids = params.dig(:question, :file_ids).to_a
          @question.attached_files = Files::File.where(id: file_ids)

          plan = plan_task

          if !plan.possible?
            render json: { errors: { base: [{ error: plan.impossible_reason }] } }, status: :unprocessable_entity
            return
          end

          if @question.save
            side_fx_service.after_create(@question, current_user)
            QAndAJob.perform_later(@question)

            render json: QuestionSerializer.new(
              @question,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @question.errors.details }, status: :unprocessable_entity
          end
        end

        def regenerate
          if !@question.background_task.finished?
            render json: { errors: { base: [{ error: :previous_task_not_yet_finished }] } }, status: :unprocessable_entity
            return
          end
          plan = plan_task
          if !plan.possible?
            render json: { errors: { base: [{ error: plan.impossible_reason }] } }, status: :unprocessable_entity
            return
          end

          if @question.save
            side_fx_service.after_regenerate(@question, current_user)
            QAndAJob.perform_later(@question)
            render json: QuestionSerializer.new(
              @question,
              params: jsonapi_serializer_params,
              include: [:background_task]
            ).serializable_hash, status: :created
          else
            render json: { errors: @question.errors.details }, status: :unprocessable_entity
          end
        end

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def set_question
          @question = Question
            .joins(:insight)
            .where(insight: { analysis: @analysis })
            .find(params[:id])
        end

        def question_params
          params.require(:question).permit(:question)
        end

        def insight_attributes
          {
            analysis: @analysis,
            filters: filters(params[:question][:filters]),
            custom_field_ids: {
              main_custom_field_id: @analysis.main_custom_field_id,
              additional_custom_field_ids: @analysis.additional_custom_field_ids
            }
          }
        end

        def side_fx_service
          @side_fx_service ||= SideFxQuestionService.new
        end

        def plan_task
          @question.background_task = QAndATask.new(analysis: @analysis)
          plan = QAndAMethod::Base.plan(@question)
          if plan.possible?
            @question.q_and_a_method = plan.q_and_a_method_class::Q_AND_A_METHOD
            @question.accuracy = plan.accuracy
          end
          plan
        end
      end
    end
  end
end
