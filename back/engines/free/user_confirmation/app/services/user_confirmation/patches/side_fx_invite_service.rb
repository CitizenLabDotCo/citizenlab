module UserConfirmation
  module Patches
    module SideFxInviteService
      def before_accept(invite)
        super
        invite.invitee.email_confirmed_at ||= invite.accepted_at
      end
    end
  end
end
