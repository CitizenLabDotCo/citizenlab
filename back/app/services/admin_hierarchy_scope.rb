# frozen_string_literal: true

# The spaces and folders a user can open on the admin projects page. What is
# inside them is shown one level down, so the admin finders leave it out of
# the level above (see their `top_level` param).
module AdminHierarchyScope
  def self.spaces(user)
    return Space.none unless AppConfiguration.instance.feature_activated?('spaces')

    # The finders use this as a subquery of ids, where the policy scope's
    # preloads would only get in the way.
    Pundit.policy_scope!(user, Space).unscope(:includes)
  end

  def self.folders(user)
    UserRoleService.new.moderatable_folders(user)
  end
end
