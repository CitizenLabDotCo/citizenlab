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

  def exclude_admins_and_moderators?(exclude_roles)
    exclude_roles == 'exclude_admins_and_moderators'
  end

  # Keeps participations without a known user (e.g. anonymous ones), since we
  # cannot tell whether they were made by an admin or moderator.
  def exclude_roles_from_participations(participations, exclude_roles)
    return participations unless exclude_admins_and_moderators?(exclude_roles)

    participations
      .where(dimension_user_id: nil)
      .or(participations.where.not(dimension_user_id: User.not_normal_user.select(:id)))
  end

  def sanitize_sql(*args)
    ActiveRecord::Base.sanitize_sql_array(args)
  end
end
