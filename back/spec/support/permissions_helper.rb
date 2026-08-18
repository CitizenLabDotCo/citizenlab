# frozen_string_literal: true

module PermissionsHelper
  # Phase permissions are only persisted once the action is overridden; until
  # then it inherits the global 'visiting' permission. Use this in specs that
  # need a phase to own its permissions.
  # See Permissions::PermissionInheritanceService.
  def override_permissions!(scope, actions: nil)
    service = Permissions::PermissionInheritanceService.new
    actions ||= Permission.available_actions(scope)
    actions.map { |action| service.override!(scope, action) }
  end
end
