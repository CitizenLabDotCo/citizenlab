module UserConfirmation
  module Patches
    module SideFxUserService
      def timestamp_registration(user);
        return if AppConfiguration.instance.feature_activated?('user_confirmation')

        super
      end

      def after_create(user, current_user)
        super
        SendConfirmationCode.call(user: user) if user.confirmation_required?
      end

      # Note: For a future iteration
      # def after_update(user, current_user)
      #   super
      #   SendConfirmationCode.call(user: user) if user.confirmation_required?
      # end
    end
  end
end
