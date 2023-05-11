# frozen_string_literal: true

module Volunteering
  module WebApi
    module V1
      class CausesController < VolunteeringController
        before_action :set_participation_context, only: :index
        before_action :set_cause, only: %i[show update destroy reorder]
        skip_before_action :authenticate_user

        def index
          @causes = policy_scope(Cause)
            .where(participation_context: @participation_context)
            .order(:ordering)
          @causes = paginate @causes

          volunteers = Volunteer.where(user: current_user, cause: @causes)
          volunteers_by_cause_id = volunteers.index_by(&:cause_id)

          render json: linked_json(
            @causes,
            Volunteering::WebApi::V1::CauseSerializer,
            params: jsonapi_serializer_params(vbci: volunteers_by_cause_id),
            include: [:user_volunteer]
          )
        end

        def show
          render json: WebApi::V1::CauseSerializer.new(
            @cause,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        def create
          @cause = Cause.new(cause_params)
          authorize @cause

          SideFxCauseService.new.before_create(@cause, current_user)
          if @cause.save
            SideFxCauseService.new.after_create(@cause, current_user)
            render json: WebApi::V1::CauseSerializer.new(
              @cause,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: @cause.errors.details }, status: :unprocessable_entity
          end
        end

        def update
          @cause.assign_attributes cause_params
          authorize @cause
          remove_image_if_requested!(@cause, cause_params, :image)

          SideFxCauseService.new.before_update(@cause, current_user)
          if @cause.save
            SideFxCauseService.new.after_update(@cause, current_user)
            render json: WebApi::V1::CauseSerializer.new(
              @cause,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :ok
          else
            render json: { errors: @cause.errors.details }, status: :unprocessable_entity
          end
        end

        def reorder
          new_ordering = reorder_params[:ordering]
          if @cause.ordering == new_ordering || @cause.insert_at(new_ordering)
            SideFxCauseService.new.after_update(@cause, current_user)
            render json: WebApi::V1::CauseSerializer.new(
              @cause,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :ok
          else
            render json: { errors: @cause.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          SideFxCauseService.new.before_destroy(@cause, current_user)
          cause = @cause.destroy
          if cause.destroyed?
            SideFxCauseService.new.after_destroy(cause, current_user)
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

        def set_cause
          @cause = Cause.find(params[:id])
          authorize @cause
        end

        def reorder_params
          params.require(:cause).permit(
            :ordering
          )
        end

        def cause_params
          params.require(:cause).permit(
            :participation_context_type,
            :participation_context_id,
            :image,
            title_multiloc: CL2_SUPPORTED_LOCALES,
            description_multiloc: CL2_SUPPORTED_LOCALES
          )
        end
      end
    end
  end
end
