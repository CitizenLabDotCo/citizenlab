# frozen_string_literal: true

class SideFxCosponsorshipService
  include SideFxHelper

  def after_accept(cosponsorship, user)
    LogActivityJob.perform_later(
      cosponsorship,
      'accepted',
      user, # We don't want anonymized users being cosponsors
      cosponsorship.updated_at.to_i,
      payload: { change: cosponsorship.status_previous_change }
    )
    create_followers cosponsorship.idea, cosponsorship.user
  end

  def create_followers(idea, user)
    Follower.find_or_create_by(followable: idea, user: user)
  end
end
