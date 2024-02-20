# frozen_string_literal: true

module Analysis
  module Patches
    module SideFxCustomFieldService
      def before_destroy(custom_field, _user)
        super
        Analysis.where(main_custom_field_id: custom_field.id).each(&:destroy!)
        Insight.delete_custom_field_references!(custom_field.id)
        AutoTaggingTask.delete_custom_field_references!(custom_field.id)
      end
    end
  end
end
