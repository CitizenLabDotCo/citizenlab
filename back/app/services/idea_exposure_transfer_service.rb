# frozen_string_literal: true

class IdeaExposureTransferService
  # Transfers anonymous idea exposures to an authenticated user.
  # Called during login to associate previously anonymous browsing history
  # with the now-authenticated user.

  def transfer_from_request(user:, request:)
    visitor_hash = VisitorHashService.new.generate_for_request(request)
    transfer(visitor_hash: visitor_hash, user: user)
  end

  def transfer(visitor_hash:, user:)
    return 0 if visitor_hash.blank? || user.blank?

    anonymous_exposures = IdeaExposure.where(visitor_hash: visitor_hash, user_id: nil)

    # Find IDs of anonymous exposures where the user already has a matching (idea_id, phase_id)
    duplicate_ids = anonymous_exposures
      .joins(
        'INNER JOIN idea_exposures AS existing ' \
        'ON existing.idea_id = idea_exposures.idea_id ' \
        'AND existing.phase_id = idea_exposures.phase_id'
      )
      .where(existing: { user_id: user.id })
      .pluck(:id)

    # Bulk update: Transfer non-duplicate exposures to the user
    transferred_count = anonymous_exposures
      .where.not(id: duplicate_ids)
      .update_all(user_id: user.id, visitor_hash: nil)

    # Bulk destroy: Delete duplicate exposures
    IdeaExposure.where(id: duplicate_ids).delete_all

    transferred_count
  end
end
