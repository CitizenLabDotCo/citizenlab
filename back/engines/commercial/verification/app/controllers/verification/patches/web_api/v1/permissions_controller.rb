# frozen_string_literal: true

module Verification
  module Patches
    module WebApi
      module V1
        module PermissionsController

          private

          def user_ui_and_json_multiloc_schemas(fields)
            super.tap do |schemas_multiloc|
              mark_locked_json_forms_fields(schemas_multiloc) if current_user
            end
          end

          def mark_locked_json_forms_fields(schemas_multiloc)
            locked_custom_fields = verification_service.locked_custom_fields(current_user).map(&:to_s)
            schemas_multiloc[:ui_schema_multiloc].each do |_locale, ui_schema|
              ui_schema[:elements]
                .select { |e| locked_custom_fields.any? { |field| e[:scope].end_with?(field) } }
                .each_with_index do |element, index|
                ui_schema[:elements][index] = element.merge(options: element[:options].to_h.merge(readonly: true, verificationLocked: true))
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
