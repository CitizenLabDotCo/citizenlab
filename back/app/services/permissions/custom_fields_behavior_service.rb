# frozen_string_literal: true

module Permissions
  # Resolves the value of Permission#custom_fields_behavior for rows that predate
  # the column, from the attributes it replaces. Used by the backfill task and,
  # until that task has run everywhere, by Permission#custom_fields_behavior.
  # Both go away once the column is backfilled and required.
  class CustomFieldsBehaviorService
    def derive(permission)
      if permission.global_custom_fields
        # 'global_custom_fields' never resolved to anything for an 'everyone'
        # permission, so what it does today is ask nothing. Calling it 'global'
        # would start asking the platform's questions on every open phase.
        return permission.permitted_by == 'everyone' ? 'disabled' : 'global'
      end

      # 'global_custom_fields' false with nothing persisted is the only way the
      # old model could express "ask nothing", so it wins over the match below
      # on a platform that has no enabled user fields at all.
      return 'disabled' if permission.permissions_custom_fields.empty?
      return 'global' if matches_platform_fields?(permission)

      'custom'
    end

    private

    # #default_fields takes `required` from the custom field rather than the
    # join record, and renumbers `ordering` from zero, so this is the exact
    # condition under which the persisted fields and the global ones resolve to
    # the same list.
    def matches_platform_fields?(permission)
      persisted = permission.permissions_custom_fields.sort_by(&:ordering).map do |field|
        [field.custom_field_id, field.required]
      end

      persisted == platform_fields
    end

    def platform_fields
      @platform_fields ||= CustomField
        .where(resource_type: 'User', enabled: true, hidden: false)
        .order(:ordering)
        .pluck(:id, :required)
    end
  end
end
