# frozen_string_literal: true

module WebApi::V1
  module Events
    class AttendancesController < ApplicationController
      def index
        event = Event.find(params[:event_id])
        authorize(event, :attendees_xlsx?)
        attendances = policy_scope(event.attendances)
        total = attendances.count
        attendances = attendances.where(attendee: User.search_by_all(params[:search])) if params[:search].present?

        week_start = Time.zone.now.beginning_of_week
        case params[:registered]
        when 'this_week'
          attendances = attendances.where(created_at: week_start..)
        when 'earlier'
          attendances = attendances.where(created_at: ...week_start)
        end

        direction = params[:sort] == '-created_at' ? :desc : :asc
        attendances = paginate(attendances.order(created_at: direction, id: direction)).includes(:attendee)

        render json: {
          **linked_json(
            attendances,
            WebApi::V1::Events::AttendanceSerializer,
            params: jsonapi_serializer_params,
            include: [:attendee],
            fields: { user: %i[first_name last_name email] }
          ),
          meta: { total: attendances.total_count, unfiltered_total: total }
        }
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
