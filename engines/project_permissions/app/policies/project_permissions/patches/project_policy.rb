# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module ProjectPolicy
      def shared_permitted_attributes
        super.unshift(:visible_to)
      end

      def moderate_for_active?
        super || (record.id && user.project_moderator?(record.id))
      end

      def show_to_non_moderators?
        return unless super

        project_public? ||
          (record.visible_to == 'groups' && user_belongs?(record.groups))
      end

      private

      def project_public?
        record.visible_to == 'public'
      end

      def user_belongs?(groups)
        return unless user

        (groups.ids & user.group_ids).present?
      end
    end
  end
end
