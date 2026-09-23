class ReportBuilder::Queries::Base
  def initialize(current_user)
    @current_user = current_user
  end

  def validate_resolution(resolution)
    valid_resolutions = %w[day week month]
    unless valid_resolutions.include?(resolution)
      raise ArgumentError, "Invalid resolution: #{resolution}. Must be one of: #{valid_resolutions.join(', ')}"
    end
  end

  private

  def exclude_admins_and_moderators_from_participations(participations, exclude_admins_and_moderators)
    return participations unless exclude_admins_and_moderators

    StatisticsRoleExclusion.exclude_admin_and_moderator_records(participations, :dimension_user_id)
  end

  def sanitize_sql(*args)
    ActiveRecord::Base.sanitize_sql_array(args)
  end
end
