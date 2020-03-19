module Volunteering
  module WebApi
    module V1
      class VolunteersController < VolunteeringController
        before_action :set_cause

        def index
          @volunteers = policy_scope(Volunteer)
            .where(cause: @cause)
            .includes(:user)
            .page(params.dig(:page, :number))
            .per(params.dig(:page, :size))

          render json: linked_json(
            @volunteers,
            Volunteering::WebApi::V1::VolunteerSerializer,
            params: fastjson_params,
            include: [:user]
          )
        end

        def create
          @volunteer = Volunteer.new(cause: @cause, user: current_user)
          authorize @volunteer

          SideFxVolunteerService.new.before_create(@volunteer, current_user)
          if @volunteer.save
            SideFxVolunteerService.new.after_create(@volunteer, current_user)
            render json: WebApi::V1::VolunteerSerializer.new(
              @volunteer,
              params: fastjson_params,
              ).serialized_json, status: :created
          else
            render json: { errors: @volunteer.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @volunteer = Volunteer.find_by!(user: current_user, cause: @cause)
          authorize(@volunteer)

          SideFxVolunteerService.new.before_destroy(@volunteer, current_user)
          volunteer = @volunteer.destroy
          if volunteer.destroyed?
            SideFxVolunteerService.new.after_destroy(volunteer, current_user)
            head :ok
          else
            head 500
          end
        end

        private

        def set_cause
          @cause = Cause.find(params[:cause_id])
        end

        def secure_controller?
          true
        end
      end
    end
  end
end