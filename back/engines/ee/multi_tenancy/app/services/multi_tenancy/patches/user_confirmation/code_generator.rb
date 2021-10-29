module MultiTenancy
  module Patches
    module UserConfirmation
      module CodeGenerator
        def call
          super
          return unless e2e?

          result.code = '1234'
        end

        private

        def e2e?
          AppConfiguration.instance.host == 'e2e.stg.citizenlab.co' || Rails.env.development?
        end
      end
    end
  end
end

UserConfirmation::CodeGenerator.prepend(MultiTenancy::Patches::UserConfirmation::CodeGenerator)
