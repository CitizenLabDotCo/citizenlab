# frozen_string_literal: true

module AnonymousExposureTransfer
  extend ActiveSupport::Concern

  private

  def transfer_anonymous_exposures(user)
    visitor_hash = VisitorHashService.new.generate_for_visitor(
      request.remote_ip,
      request.user_agent
    )
    IdeaExposureTransferService.new.transfer(visitor_hash: visitor_hash, user: user)
  rescue RuntimeError => e
    Rails.logger.warn("Anonymous exposure transfer skipped: #{e.message}")
  end
end
