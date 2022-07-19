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

              def self.attributes_hash(record, fieldset = nil, params = {})
                with_custom_fields_at_attributes_level super
              end

              private

              def self.with_custom_fields_at_attributes_level(hash)
                custom_field_hash = hash.delete :custom_field_values
                return hash unless custom_field_hash

                hash.merge custom_field_hash.symbolize_keys
              end
            end
          end
        end
      end
    end
  end
end
