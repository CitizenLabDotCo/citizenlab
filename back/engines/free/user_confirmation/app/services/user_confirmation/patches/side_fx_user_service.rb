module UserConfirmation
  module Patches
    module SideFxUserService
      def after_create(user)
        super
        SendNewConfirmationCode.call(user: user)
      end
    end
  end
end
