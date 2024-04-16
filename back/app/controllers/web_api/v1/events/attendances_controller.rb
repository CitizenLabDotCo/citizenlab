# frozen_string_literal: true

module WebApi::V1
  module Events
    class AttendancesController < ApplicationController
      def index
        event = Event.find(params[:event_id])
        attendances = policy_scope(event.attendances).order(created_at: :asc)
        paginated_attendances = paginate(attendances)
        render json: linked_json(paginated_attendances, WebApi::V1::Events::AttendanceSerializer)
      end

      # GET event_attendances/:event_id/as_xlsx
      def index_xlsx
        authorize %i[events attendance], :index_xlsx?
        event = Event.find(params[:id])
        attendees = User.where(id: event.attendances.pluck(:attendee_id))

        I18n.with_locale(current_user&.locale) do
          xlsx = XlsxService.new.generate_attendees_xlsx attendees
          send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'attendees.xlsx'
        end
      end

      def create
        attendance = ::Events::Attendance.new(
          attendee_id: current_user.id,
          event_id: params[:event_id]
        )

        authorize(attendance)
        attendance.save!
        side_fx.after_create(attendance, current_user)

        render(
          json: WebApi::V1::Events::AttendanceSerializer.new(attendance).serializable_hash,
          status: :created
        )
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def destroy
        attendance = ::Events::Attendance.find(params[:id])

        authorize(attendance)
        attendance.destroy!
        side_fx.after_destroy(attendance, current_user)

        head :no_content
      end

      private

      def side_fx
        @side_fx ||= ::Events::SideFxAttendanceService.new
      end
    end
  end
end
