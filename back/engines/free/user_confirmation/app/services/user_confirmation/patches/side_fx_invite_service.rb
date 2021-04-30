module UserConfirmation
  module Patches
    module SideFxInviteService
      def before_accept(invite)
        super
        return unless AppConfiguration.instance.feature_activated?('user_confirmation')

        invite.invitee.email_confirmed_at ||= invite.accepted_at
      end
    end
  end
end
