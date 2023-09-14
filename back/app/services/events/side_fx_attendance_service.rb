# frozen_string_literal: true

module Events
  class SideFxAttendanceService < BaseSideFxService
    private

    def resource_name
      :'events/attendance'
    end
  end
end
