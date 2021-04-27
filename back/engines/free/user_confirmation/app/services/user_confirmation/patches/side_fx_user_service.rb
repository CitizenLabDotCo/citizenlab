module UserConfirmation
  module Patches
    module SideFxUserService
      def after_create(user, current_user)
        super
        SendConfirmationCode.call(user: user) if user.requires_confirmation?
      end
    end
  end
end
