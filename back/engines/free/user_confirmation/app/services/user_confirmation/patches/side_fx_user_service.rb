module UserConfirmation
  module Patches
    module SideFxUserService
      def after_crease(user)
        super
        SendConfirmationCode.call(user: user)
      end
    end
  end
end
