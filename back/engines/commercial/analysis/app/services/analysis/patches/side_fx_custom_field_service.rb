# frozen_string_literal: true

module Analysis
  module Patches
    module SideFxCustomFieldService
      def before_destroy(custom_field, _user)
        super
        Insight.delete_custom_field_references!(custom_field.id)
        AutoTaggingTask.delete_custom_field_references!(custom_field.id)
      end
    end
  end
end
