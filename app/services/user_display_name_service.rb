# Service that adapts the user name that is shown depending on the context.
# For now, it can be used to "shallow anonymization" of users, depending on the
# application configuration and the permissions of the current user.

class UserDisplayNameService

  # @param [AppConfiguration] app_configuration
  # @param [User,nil] current_user
  def initialize(app_configuration, current_user = nil)
    @app_configuration = app_configuration
    @current_user = current_user
    @is_admin = !!@current_user&.admin?
  end

  # Compute the name that should be displayed depending on the context.
  # Returns nil when user is nil, but logs a warning.
  #
  # @param [User,nil] user
  # @return [String,nil]
  def display_name(user)
    if user.nil?
      Rails.logger.warn({
        message: "Trying to get the display_name of 'nil'.",
        stack: caller
      }.to_json)
    end
    display_name!(user)
  end

  # nil-friendly version of #display_name.
  # Return nil when 'user' is nil without logging a warning.
  #
  # @param [User,nil] user
  # @return [String,nil]
  def display_name!(user)
    return nil if user.nil?
    [user.first_name, last_name(user)].join(' ')
  end

  # Returns nil when user is nil, but logs a warning.
  #
  # @param [User, nil] user
  # @return [String]
  def last_name(user)
    if user.nil?
      Rails.logger.warn({
        message: "Trying to get the last_name of 'nil'.",
        stack: caller
      }.to_json)
      return nil
    end
    last_name!(user)
  end

  # nil-friendly version of #last_name.
  # Returns nil when 'user' is nil without logging a warning.
  #
  # @param [User, nil] user
  # @return [String]
  def last_name!(user)
    return nil if user.nil?
    can_see_fullname_of?(user) ? user.last_name : self.class.initial(user.last_name)
  end

  def restricted?
    !admin? && @app_configuration.feature_activated?("abbreviated_user_names")
  end

  private

  # @param [User] user
  # @return [Boolean]
  def can_see_fullname_of?(user)
    return true unless restricted?
    user.admin? || (user == @current_user)
  end

  def admin?
    @is_admin
  end

  # @param [String] name
  # @return [String]
  def self.initial(name)
    name[0] + '.'
  end
end
