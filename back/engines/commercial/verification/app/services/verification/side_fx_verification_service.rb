# frozen_string_literal: true

module Verification
  class SideFxVerificationService
    include SideFxHelper

    def before_create(verification, current_user); end

    def after_create(verification, current_user)
      verification.user.update!(verified: true)
      LogActivityJob.perform_later(verification, 'created', current_user, verification.created_at.to_i, payload: { method: verification.method_name })
      UpdateMemberCountJob.perform_later
    end
  end
end
