# frozen_string_literal: true

module Verification
  module Patches
    module WebApi
      module V1
        module PermissionsController
          private

          def user_ui_and_json_multiloc_schemas(fields)
            return super if fields.empty?

            super.tap do |schemas|
              mark_locked_json_forms_fields(schemas) if current_user
            end
          end

          def mark_locked_json_forms_fields(schemas)
            locked_custom_fields = verification_service.locked_custom_fields(current_user).map(&:to_s)

            # Mark fields as locked & read only
            schemas[:ui_schema_multiloc].each_value do |ui_schema|
              ui_schema[:elements]
                .select { |e| locked_custom_fields.any? { |field| e[:scope].end_with?(field) } }
                .each_with_index do |element, index|
                ui_schema[:elements][index] = element.merge(options: element[:options].to_h.merge(readonly: true, verificationLocked: true))
              end
            end

            # Mark fields as required (if not already required)
            schemas[:json_schema_multiloc].each_value do |json_schema|
              json_schema[:required] = [] if json_schema[:required].nil?
              locked_custom_fields.each do |locked_field|
                json_schema[:required] << locked_field if json_schema[:required].exclude?(locked_field)
              end
            end
          end

          def verification_service
            @verification_service ||= VerificationService.new
          end
        end
      end
    end
  end
end
