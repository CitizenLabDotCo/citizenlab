module CustomStatuses
  module WebApi
    module V1
      class IdeaStatusesController < ApplicationController
        before_action :set_idea_status, except: %i[create]

        def create
          @idea_status = IdeaStatus.new(idea_status_params)
          authorize @idea_status, policy_class: IdeaStatusPolicy
          if @idea_status.save
            render json: ::WebApi::V1::IdeaStatusSerializer.new(@idea_status).serialized_json, status: :ok
          else
            render json: { errors: @idea_status.errors }, status: :unprocessable_entity
          end
        end

        def update
          @idea_status.insert_at(params.dig(:idea_status, :ordering)) if params.dig(:idea_status, :ordering)
          if @idea_status.update(idea_status_params)
            render json: ::WebApi::V1::IdeaStatusSerializer.new(@idea_status).serialized_json, status: :ok
          else
            render json: { errors: @idea_status.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          if @idea_status.destroy
            head :no_content
          else
            render json: { errors: @idea_status.errors }, status: :not_allowed
          end
        end

        private

        def set_idea_status
          @idea_status = IdeaStatus.find(params[:id])
          authorize @idea_status, policy_class: IdeaStatusPolicy
        end

        def idea_status_params
          params.require(:idea_status).permit(
            :code, :color,
            title_multiloc: CL2_SUPPORTED_LOCALES,
            description_multiloc: CL2_SUPPORTED_LOCALES
          )
        end
      end
    end
  end
end