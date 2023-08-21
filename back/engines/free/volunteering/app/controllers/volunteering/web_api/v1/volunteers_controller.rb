# frozen_string_literal: true

module Volunteering
  module WebApi
    module V1
      class VolunteersController < VolunteeringController
        before_action :set_cause, only: %i[index create destroy]
        before_action :set_participation_context, only: :index_xlsx
        skip_before_action :authenticate_user

        def index
          @volunteers = policy_scope(Volunteer).where(cause: @cause).includes(:user)
          @volunteers = paginate @volunteers

          render json: linked_json(
            @volunteers,
            Volunteering::WebApi::V1::VolunteerSerializer,
            params: jsonapi_serializer_params,
            include: [:user]
          )
        end

        # GET projects/:project_id/volunteers/as_xlsx
        # GET phases/:phase_id/volunteers/as_xlsx
        def index_xlsx
          authorize %i[volunteering volunteer], :index_xlsx?

          @volunteers = policy_scope(Volunteer)
            .joins(:cause)
            .where(volunteering_causes: { participation_context_id: @participation_context })
            .includes(:user, :cause)

          I18n.with_locale(current_user&.locale) do
            xlsx = Volunteering::XlsxService.new.generate_xlsx @participation_context, @volunteers, view_private_attributes: Pundit.policy!(current_user, User).view_private_attributes?
            send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'volunteers.xlsx'
          end
        end

        def create
          @volunteer = Volunteer.new(cause: @cause, user: current_user)
          authorize @volunteer

          if @volunteer.save
            SideFxVolunteerService.new.after_create(@volunteer, current_user)
            render json: WebApi::V1::VolunteerSerializer.new(
              @volunteer,
              params: jsonapi_serializer_params
            ).serializable_hash, status: :created
          else
            render json: { errors: @volunteer.errors.details }, status: :unprocessable_entity
          end
        end

        def destroy
          @volunteer = Volunteer.find_by!(user: current_user, cause: @cause)
          authorize(@volunteer)

          volunteer = @volunteer.destroy
          if volunteer.destroyed?
            SideFxVolunteerService.new.after_destroy(volunteer, current_user)
            head :ok
          else
            head :internal_server_error
          end
        end

        private

        def set_cause
          @cause = Cause.find(params[:cause_id])
        end

        def set_participation_context
          if params[:project_id]
            @participation_context = Project.find(params[:project_id])
          elsif params[:phase_id]
            @participation_context = Phase.find(params[:phase_id])
          else
            head :not_found
          end
        end
      end
    end
  end
end
