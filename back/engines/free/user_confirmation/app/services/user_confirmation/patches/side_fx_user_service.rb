module UserConfirmation
  module Patches
    module SideFxUserService
      def after_create(user, current_user)
        super
        SendConfirmationCode.call(user: user)
      end
    end
  end
end
