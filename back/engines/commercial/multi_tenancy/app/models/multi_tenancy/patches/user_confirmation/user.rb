# frozen_string_literal: true

module MultiTenancy
  module Patches
    module UserConfirmation
      module User
        private

        def use_fake_code?
          super || AppConfiguration.instance.host == 'e2e.stg.citizenlab.co'
        end
      end
    end
  end
end
