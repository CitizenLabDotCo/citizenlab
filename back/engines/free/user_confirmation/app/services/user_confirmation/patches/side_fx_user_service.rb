module UserConfirmation
  module Patches
    module SideFxUserService
      def after_create(user, current_user)
        super
        SendConfirmationCode.call(user: user) unless user.invited?
      end
    end
  end
end
