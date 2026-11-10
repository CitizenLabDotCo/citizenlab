# frozen_string_literal: true

module Volunteering
  module WebApi
    module V1
      class VolunteersController < VolunteeringController
        before_action :set_cause, only: %i[index create destroy]
        before_action :set_phase, only: %i[index_by_phase index_xlsx]
        skip_before_action :authenticate_user

        def index
          @volunteers = policy_scope(Volunteer).where(cause: @cause)
          @volunteers = paginate @volunteers
          @volunteers = @volunteers.includes(:user)

          render json: linked_json(
            @volunteers,
            Volunteering::WebApi::V1::VolunteerSerializer,
            params: jsonapi_serializer_params,
            include: [:user]
          )
        end

        # GET phases/:phase_id/volunteers
        def index_by_phase
          authorize %i[volunteering volunteer], :index_by_phase?

          @volunteers = policy_scope(Volunteer)
            .joins(:cause)
            .where(volunteering_causes: { phase_id: @phase })
            .includes(:user)
          @volunteers = @volunteers.where(cause_id: params[:causes]) if params[:causes].present?
          @volunteers = @volunteers.where(user: User.search_by_all(params[:search])) if params[:search].present?
          direction = params[:sort] == 'created_at' ? :asc : :desc
          # The id keeps the order stable across pages when timestamps tie.
          @volunteers = @volunteers.order(created_at: direction, id: direction)
          @volunteers = paginate @volunteers

          render json: {
            **linked_json(
              @volunteers,
              Volunteering::WebApi::V1::VolunteerSerializer,
              params: jsonapi_serializer_params,
              include: [:user]
            ),
            meta: { total: @volunteers.total_count }
          }
        end

        # GET phases/:phase_id/volunteers/as_xlsx
        def index_xlsx
          authorize %i[volunteering volunteer], :index_xlsx?

          @volunteers = policy_scope(Volunteer)
            .order(:created_at)
            .joins(:cause)
            .where(volunteering_causes: { phase_id: @phase })
            .includes(:user, :cause)

          I18n.with_locale(current_user&.locale) do
            xlsx = Volunteering::XlsxService.new.generate_xlsx @phase, @volunteers, view_private_attributes: true
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

        def set_phase
          if params[:phase_id]
            @phase = Phase.find(params[:phase_id])
          else
            head :not_found
          end
        end
      end
    end
  end
end
