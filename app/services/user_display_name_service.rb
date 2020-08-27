# Service that adapts the user name that is shown depending on the context.
# For now, it can be used to "shallow anonymization" of users, depending on the
# tenant settings and the permissions of the current user.

class UserDisplayNameService

  # @param [Tenant] tenant
  # @param [User] current_user
  def initialize(tenant, current_user = nil)
    @tenant = tenant
    @current_user = current_user
    @is_admin = !!@current_user&.admin?
  end

  # @param [User] user
  # @return [String]
  def display_name(user)
    [user.first_name, last_name(user)].join(' ')
  end

  # @param [User] user
  # @return [String]
  def last_name(user)
    can_see_fullname_of?(user) ? user.last_name : self.class.initial(user.last_name)
  end

  private

  # @param [User] user
  # @return [Boolean]
  def can_see_fullname_of?(user)
    return true if user.admin? || !@tenant.abbreviated_user_names_enabled?
    is_admin? || (user == @current_user)
  end

  def is_admin?
    @is_admin
  end

  # @param [String] name
  # @return [String]
  def self.initial(name)
    name[0] + '.'
  end
end
