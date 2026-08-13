# frozen_string_literal: true

module Permissions
  # Phase permissions are inheritable: as long as an action has no permission
  # row of its own, it follows the global 'visiting' permission, which drives the
  # platform-wide sign up / log in flow. Such an action is resolved on the fly
  # into an unsaved Permission copied from 'visiting' — the "inherited" state.
  #
  # An admin opts an action out of that link by *overriding* it, which persists
  # the copy; from then on the action is customised independently. Reverting
  # destroys the row and puts the action back in the inherited state.
  #
  # Global permissions ('visiting', 'following', 'attending_event' with no
  # scope) never inherit — they are always persisted.
  class PermissionInheritanceService
    SOURCE_ACTION = 'visiting'

    # Everything on a permission that is copied from 'visiting', i.e. every
    # attribute except its identity (id, action, scope) and timestamps.
    INHERITABLE_ATTRIBUTES = %w[
      permitted_by
      global_custom_fields
      verification_expiry
      access_denied_explanation_multiloc
      everyone_tracking_enabled
      user_fields_in_form
      user_data_collection
      require_confirmed_email
      confirmed_email_expiry
      require_name
      require_password
      require_verification
      require_confirmed_phone_number
      confirmed_phone_number_expiry
    ].freeze

    class << self
      # Memoized per request (and per tenant: Current is reset on every Apartment
      # switch). Resolving inherited permissions happens once per action per
      # phase while serializing action descriptors, so without this a project
      # index would re-query the same row dozens of times.
      def source_permission
        Current.global_visiting_permission ||=
          Permission.includes(:groups, :permissions_custom_fields).find_by(
            action: SOURCE_ACTION, permission_scope: nil
          )
      end

      def clear_source_permission_cache
        Current.global_visiting_permission = nil
      end
    end

    # Only phases inherit. A nil scope is the global scope itself, which holds
    # the source permission.
    def inheritable_scope?(scope)
      scope.is_a?(Phase)
    end

    # The permission that governs `action` on `scope`: the persisted row if the
    # action was overridden, otherwise an unsaved copy of the global 'visiting'
    # permission. Returns nil when the action isn't available for the scope.
    def find(scope, action)
      permission = persisted_permission(scope, action)
      return permission if permission
      return nil unless inheritable_scope?(scope)
      return nil unless Permission.available_actions(scope).include?(action)

      build_inherited(scope, action)
    end

    # Every permission that applies to `scope`, in the scope's action order,
    # mixing persisted (overridden) and inherited ones.
    def effective_permissions(scope)
      persisted = Permission.where(permission_scope: scope)
        .includes(:groups, :permission_scope, :custom_fields, permissions_custom_fields: [custom_field: [:options]])
        .index_by(&:action)

      Permission.enabled_actions(scope).filter_map do |action|
        persisted[action] || (build_inherited(scope, action) if inheritable_scope?(scope))
      end
    end

    # Detach `action` from the global 'visiting' permission by persisting a copy
    # of it, so it can be customised independently. Returns the existing
    # permission untouched if the action was already overridden.
    def override!(scope, action)
      existing = persisted_permission(scope, action)
      return existing if existing

      raise UnsupportedScope, "Scope #{scope.inspect} does not support inheritance" unless inheritable_scope?(scope)

      source = self.class.source_permission
      permission = nil

      ActiveRecord::Base.transaction do
        permission = Permission.new(
          inheritable_attributes(source).merge(action: action, permission_scope: scope)
        )
        permission.groups = source.groups.to_a if source
        permission.save!
        copy_permissions_custom_fields!(source, permission) if source
      end

      permission
    end

    # Put the action back under the global 'visiting' permission. Its own
    # groups and persisted demographic questions are destroyed along with it.
    def inherit!(permission)
      raise UnsupportedScope, 'Only phase permissions can be inherited' unless inheritable_scope?(permission.permission_scope)

      scope = permission.permission_scope
      action = permission.action
      permission.destroy!
      build_inherited(scope, action)
    end

    # Whether `permission` is an exact copy of the global 'visiting' permission,
    # i.e. overriding it changes nothing. Used to decide which existing
    # permissions can be deleted in favour of inheriting.
    def matches_source?(permission)
      source = self.class.source_permission
      return false unless source
      return false unless inheritable_scope?(permission.permission_scope)
      return false unless inheritable_attributes(permission) == inheritable_attributes(source)
      return false unless permission.groups.ids.sort == source.groups.ids.sort

      custom_fields_match?(permission, source)
    end

    def build_inherited(scope, action)
      source = self.class.source_permission
      permission = build_from_source(source, scope, action)
      permission.inherited = true

      # Preload the associations in memory rather than letting them query for an
      # unsaved record (which would return nothing).
      preload_association(permission, :groups, source ? source.groups.to_a : [])
      inherited_fields = inherited_custom_fields(source, permission)
      preload_association(permission, :permissions_custom_fields, inherited_fields)
      preload_association(permission, :custom_fields, inherited_fields.map(&:custom_field))

      permission.readonly!
      permission
    end

    class UnsupportedScope < StandardError; end

    private

    def persisted_permission(scope, action)
      Permission.find_by(permission_scope: scope, action: action)
    end

    # Starts from the model's own creation defaults, so a tenant without a
    # 'visiting' permission (which shouldn't happen, but fixtures and specs can
    # get there before update_global_permissions has run) still ends up with a
    # usable permission.
    def build_from_source(source, scope, action)
      permission = Permission.new(action: action, permission_scope: scope)
      permission.apply_creation_defaults
      permission.assign_attributes(inheritable_attributes(source))
      permission
    end

    def inheritable_attributes(source)
      return {} unless source

      source.attributes.slice(*INHERITABLE_ATTRIBUTES)
    end

    def inherited_custom_fields(source, permission)
      return [] unless source
      # Global custom fields aren't persisted on the source either: they are
      # derived from the platform's user fields, and the same derivation applies
      # to the inheriting permission.
      return [] if source.global_custom_fields

      source.permissions_custom_fields.map do |field|
        PermissionsCustomField.new(
          custom_field: field.custom_field,
          required: field.required,
          ordering: field.ordering,
          permission: permission
        )
      end
    end

    def preload_association(record, name, target)
      association = record.association(name)
      association.target = target
      association.loaded!
    end

    def copy_permissions_custom_fields!(source, permission)
      return if source.global_custom_fields

      source.permissions_custom_fields.each do |field|
        permission.permissions_custom_fields.create!(
          custom_field_id: field.custom_field_id,
          required: field.required,
          ordering: field.ordering
        )
      end
    end

    def custom_fields_match?(permission, source)
      fingerprint = lambda do |record|
        record.permissions_custom_fields.map { |f| [f.custom_field_id, f.required, f.ordering] }.sort
      end
      fingerprint.call(permission) == fingerprint.call(source)
    end
  end
end
