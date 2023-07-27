# frozen_string_literal: true

module WebApi::V1
  module Events
    class AttendancesController < ApplicationController
      def create
        attendance = ::Events::Attendance.new(
          attendee_id: current_user.id,
          event_id: params[:event_id]
        )

        authorize(attendance)
        attendance.save!

        render(
          json: WebApi::V1::Events::AttendanceSerializer.new(attendance).serializable_hash,
          status: :created
        )
      end

      def destroy
        attendance = ::Events::Attendance.find(params[:id])

        authorize(attendance)
        attendance.destroy!

        head :no_content
      end
    end
  end
end
