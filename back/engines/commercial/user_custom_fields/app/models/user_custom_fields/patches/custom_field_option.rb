# frozen_string_literal: true

module UserCustomFields
  module Patches
    module CustomFieldOption
      def self.included(base)
        base.class_eval do
          after_destroy :update_ref_distribution

          # Options of the domicile custom field are associated with an area.
          # The two associated resources are kept in sync: changes mode to the
          # area are reflected in the option, and vice versa.
          has_one :area, dependent: :nullify
          after_update :update_area
        end
      end

      private

      def update_ref_distribution
        custom_field.current_ref_distribution&.sync_with_options!
      end

      def update_area
        return unless area
        return unless ordering_previously_changed? || title_multiloc_previously_changed?

        area.update(
          ordering: ordering,
          title_multiloc: title_multiloc
        )
      end
    end
  end
end
