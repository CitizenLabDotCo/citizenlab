# frozen_string_literal: true

class CleanupExpiredClaimTokensJob < ApplicationJob
  self.priority = 90

  def run
    num_deleted = ClaimTokenService.cleanup_expired
    logger.info('Deleting expired claim tokens', num_deleted: num_deleted)
  end
end
