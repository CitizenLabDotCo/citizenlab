# frozen_string_literal: true

class IdeaExposureTransferService
  # Transfers anonymous idea exposures to an authenticated user.
  # Called during login to associate previously anonymous browsing history
  # with the now-authenticated user.

  def transfer(visitor_hash:, user:)
    return 0 if visitor_hash.blank? || user.blank?

    anonymous_exposures = IdeaExposure.where(visitor_hash: visitor_hash, user_id: nil)
    transferred_count = 0

    anonymous_exposures.find_each do |exposure|
      existing = IdeaExposure.exists?(
        user_id: user.id,
        idea_id: exposure.idea_id,
        phase_id: exposure.phase_id
      )

      if existing
        # Delete the anonymous duplicate - user already has this exposure
        exposure.destroy
      else
        # Transfer the exposure to the user, clearing visitor_hash (XOR constraint)
        exposure.update!(user_id: user.id, visitor_hash: nil)
        transferred_count += 1
      end
    end

    transferred_count
  end
end
