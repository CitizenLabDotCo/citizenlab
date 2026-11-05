# frozen_string_literal: true

module IdeaCustomFields
  module Extensions
    module WebApi
      module V1
        module IdeaSerializer
          def self.included(base)
            base.class_eval do
              attribute(:custom_field_values) do |idea, params|
                user = current_user(params)
                idea.custom_field_answers
                  .select { |answer| CustomFieldAnswerPolicy.new(user, answer).show? }
                  .to_h { [it.key, it.value] }
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
