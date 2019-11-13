module Polls
  module WebApi
    module V1
      class OptionsController < PollsController
        before_action :set_question, only: [:index, :create]
        before_action :set_option, only: [:show, :update, :destroy, :reorder]

        def index
          @options = policy_scope(Option)
            .where(question: @question)
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))
            .order(:ordering)

          render json: linked_json(
            @options,
            Polls::WebApi::V1::OptionSerializer,
            params: fastjson_params,
            )
        end

        def show
          render json: WebApi::V1::OptionSerializer.new(
            @option,
            params: fastjson_params
            ).serialized_json
        end

        def create
          @option = Option.new(option_params)
          @option.question = @question

          authorize @option

          SideFxOptionService.new.before_create(@option, current_user)
          if @option.save
            SideFxOptionService.new.after_create(@option, current_user)
            render json: WebApi::V1::OptionSerializer.new(
              @option,
              params: fastjson_params,
              ).serialized_json, status: :created
          else
            render json: { errors: @option.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @option.assign_attributes option_params
          authorize @option
          SideFxOptionService.new.before_update(@option, current_user)
          if @option.save
            SideFxOptionService.new.after_update(@option, current_user)
            render json: WebApi::V1::OptionSerializer.new(
              @option,
              params: fastjson_params,
              ).serialized_json, status: :ok
          else
            render json: { errors: @option.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          new_ordering = reorder_params[:ordering]
          if @option.ordering == new_ordering || @option.insert_at(new_ordering)
            SideFxOptionService.new.after_update(@option, current_user)
            render json: WebApi::V1::OptionSerializer.new(
              @option,
              params: fastjson_params,
              ).serialized_json, status: :ok
          else
            render json: {errors: @option.errors.details}, status: :unprocessable_entity
          end
        end

        def destroy
          SideFxOptionService.new.before_destroy(@option, current_user)
          option = @option.destroy
          if option.destroyed?
            SideFxOptionService.new.after_destroy(option, current_user)
            head :ok
          else
            head 500
          end
        end

        private

        def set_question
          @question = Question.find(params[:poll_question_id])          
        end

        def set_option
          @option = Option.find(params[:id])
          authorize @option
        end

        def reorder_params
          params.require(:option).permit(
            :ordering
          )
        end

        def option_params
          params.require(:option).permit(
            title_multiloc: CL2_SUPPORTED_LOCALES,
          )
        end

        def secure_controller?
          false
        end
      end
    end
  end
end