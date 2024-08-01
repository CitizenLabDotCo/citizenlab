# frozen_string_literal: true

module Verification
  module Patches
    module WebApi
      module V1
        module UserUiSchemaGeneratorService
          def locked_custom_fields
            @locked_custom_fields ||= VerificationService.new.locked_custom_fields(current_user).map(&:to_s)
          end
        end
      end
    end
  end
end
