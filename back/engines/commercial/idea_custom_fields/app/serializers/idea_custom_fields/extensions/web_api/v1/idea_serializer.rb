# frozen_string_literal: true

module IdeaCustomFields
  module Extensions
    module WebApi
      module V1
        module IdeaSerializer
          def self.included(base)
            base.class_eval do
              attribute :custom_field_values, if: proc {
                AppConfiguration.instance.feature_activated? 'idea_custom_fields'
              } do |idea|
                CustomFieldService.remove_disabled_custom_fields idea.custom_field_values
              end
            end
          end
        end
      end
    end
  end
end
