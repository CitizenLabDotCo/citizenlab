# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class QuestionsController < ApplicationController
        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis
        before_action :set_question, only: [:show]

        def show
          render json: QuestionSerializer.new(@question, params: jsonapi_serializer_params).serializable_hash
        end

        # Used to check whether a question is possible with the given filters,
        # front-end should call this before initiating the question
        def pre_check
          @question = Question.new(
            background_task: QAndATask.new(analysis: @analysis),
            **question_params.except(:filters),
            insight_attributes: {
              analysis: @analysis,
              **question_params.slice(:filters)
            }
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
            **question_params.except(:filters),
            insight_attributes: {
              analysis: @analysis,
              **question_params.slice(:filters)
            }
          )
          plan = QAndAMethod::Base.plan(@question)
          @question.q_and_a_method = plan.q_and_a_method_class::Q_AND_A_METHOD
          @question.accuracy = plan.accuracy

          if @question.save && plan.possible?
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
          permitted_dynamic_filter_keys = []
          permitted_dynamic_filter_array_keys = { tag_ids: [] }

          params[:question][:filters].each_key do |key|
            if key.match?(/^author_custom_([a-f0-9-]+)_(from|to)$/)
              permitted_dynamic_filter_keys << key
            elsif key.match?(/^author_custom_([a-f0-9-]+)$/)
              permitted_dynamic_filter_array_keys[key] = []
            end
          end

          params.require(:question).permit(
            :question,
            filters: [
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
            ]
          )
        end

        def side_fx_service
          @side_fx_service ||= SideFxQuestionService.new
        end
      end
    end
  end
end
