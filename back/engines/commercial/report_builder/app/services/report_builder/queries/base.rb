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

  def validate_roles(roles)
    return if roles.nil?

    valid_roles = %w[admin project_folder_moderator project_moderator user]

    roles.each do |role|
      unless valid_roles.include?(role)
        raise ArgumentError, "Invalid role: #{role}. Must be one of: #{valid_roles.join(', ')}"
      end
    end
  end
end
