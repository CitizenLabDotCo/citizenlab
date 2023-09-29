# frozen_string_literal: true

module Events
  class SideFxAttendanceService < BaseSideFxService
    def after_create(resource, user)
      super(resource, user)
      UpdateMemberCountJob.perform_later
    end

    def after_destroy(frozen_resource, user)
      super(frozen_resource, user)
      UpdateMemberCountJob.perform_later
    end

    private

    def resource_name
      :'events/attendance'
    end
  end
end
