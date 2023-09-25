# frozen_string_literal: true

module PublicApi
  class V2::EventAttendancesController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Events::Attendance.all, V2::EventAttendanceSerializer, root_key: 'event_attendances'
    end

    def show
      show_item Events::Attendance.find(params[:id]), V2::EventAttendanceSerializer, root_key: 'event_attendance'
    end
  end
end
