# frozen_string_literal: true

module UserConfirmation
  module Patches
    module SideFxUserService
      def after_create(user, current_user)
        super
        SendConfirmationCode.call(user: user) if user.confirmation_required?
      end

      # NOTE: For a future iteration
      # def after_update(user, current_user)
      #   super
      #   SendConfirmationCode.call(user: user) if user.confirmation_required?
      # end
    end
  end
end
