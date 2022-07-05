# frozen_string_literal: true

module UserCustomFields
  module Patches
    module CustomFieldOption
      def self.included(base)
        base.class_eval do
          after_destroy :update_ref_distribution
        end
      end

      private

      def update_ref_distribution
        custom_field.current_ref_distribution&.sync_with_options!
      end
    end
  end
end
