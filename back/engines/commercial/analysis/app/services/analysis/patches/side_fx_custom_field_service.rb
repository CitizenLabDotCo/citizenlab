# frozen_string_literal: true

module Analysis
  module Patches
    module SideFxCustomFieldService
      def before_destroy(custom_field, _user)
        super
        Analysis.where(main_custom_field_id: custom_field.id).each(&:destroy!)
        Analysis.includes(:analyses_additional_custom_fields).where(analyses_additional_custom_fields: { custom_field_id: custom_field.id }).each do |analysis|
          analysis.destroy! if analysis.associated_custom_fields.map(&:id) == [custom_field.id]
        end
        Insight.delete_custom_field_references!(custom_field.id)
        AutoTaggingTask.delete_custom_field_references!(custom_field.id)
      end
    end
  end
end
