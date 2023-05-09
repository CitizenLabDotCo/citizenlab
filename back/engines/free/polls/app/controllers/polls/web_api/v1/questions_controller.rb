# frozen_string_literal: true

module Polls
  module WebApi
    module V1
      class QuestionsController < PollsController
        before_action :set_participation_context, only: :index
        before_action :set_question, only: %i[show update destroy reorder]
        skip_before_action :authenticate_user

        def index
          @questions = policy_scope(Question)
            .where(participation_context: @participation_context)
            .includes(:options)
            .order(:ordering)
          @questions = paginate @questions

          render json: linked_json(
            @questions,
            Polls::WebApi::V1::QuestionSerializer,
            params: fastjson_params,
            include: [:options]
          )
        end

        def show
          render json: WebApi::V1::QuestionSerializer.new(
            @question,
            params: fastjson_params
          ).serializable_hash.to_json
        end

        def create
          @question = Question.new(question_params)
          authorize @question

          SideFxQuestionService.new.before_create(@question, current_user)
          if @question.save
            SideFxQuestionService.new.after_create(@question, current_user)
            render json: WebApi::V1::QuestionSerializer.new(
              @question,
              params: fastjson_params,
              include: [:options]
            ).serializable_hash.to_json, status: :created
          else
            render json: { errors: @question.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @question.assign_attributes question_params
          authorize @question
          SideFxQuestionService.new.before_update(@question, current_user)
          if @question.save
            SideFxQuestionService.new.after_update(@question, current_user)
            render json: WebApi::V1::QuestionSerializer.new(
              @question,
              params: fastjson_params,
              include: [:options]
            ).serializable_hash.to_json, status: :ok
          else
            render json: { errors: @question.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          new_ordering = reorder_params[:ordering]
          if @question.ordering == new_ordering || @question.insert_at(new_ordering)
            SideFxQuestionService.new.after_update(@question, current_user)
            render json: WebApi::V1::QuestionSerializer.new(
              @question,
              params: fastjson_params,
              include: [:options]
            ).serializable_hash.to_json, status: :ok
          else
            render json: { errors: @question.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          SideFxQuestionService.new.before_destroy(@question, current_user)
          question = @question.destroy
          if question.destroyed?
            SideFxQuestionService.new.after_destroy(question, current_user)
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def set_participation_context
          if params[:project_id]
            @participation_context = Project.find(params[:project_id])
          elsif params[:phase_id]
            @participation_context = Phase.find(params[:phase_id])
          else
            head :not_found
          end
        end

        def set_question
          @question = Question.find(params[:id])
          authorize @question
        end

        def reorder_params
          params.require(:question).permit(
            :ordering
          )
        end

        def question_params
          params.require(:question).permit(
            :participation_context_type,
            :participation_context_id,
            :question_type,
            :max_options,
            title_multiloc: CL2_SUPPORTED_LOCALES
          )
        end
      end
    end
  end
end
