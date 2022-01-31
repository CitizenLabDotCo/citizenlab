class SideFxAttendanceService
  include SideFxHelper

  def before_create(attendance, user); end

  def after_create(attendance, user)
    LogActivityJob.perform_later attendance, 'created', user, attendance.created_at.to_i
  end

  def before_destroy(attendance, user); end

  def after_destroy(frozen_attendance, user)
    serialized_attendance = clean_time_attributes frozen_attendance.attributes
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_attendance),
      'deleted', user, Time.now.to_i,
      payload: { attendance: serialized_attendance }
    )
  end
end
