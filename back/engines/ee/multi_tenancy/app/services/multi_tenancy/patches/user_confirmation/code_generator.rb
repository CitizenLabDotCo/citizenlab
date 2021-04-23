module MultiTenancy
  module Patches
    module UserConfirmation
      module CodeGenerator
        def call
          result.code = '1234' && return if e2e?
          super
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
