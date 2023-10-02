# frozen_string_literal: true

# Because we never delete reactions (votes), but we set user_id to null when user is deleted,
# we need to keep track of the verification_hashed_uids of the user who reacted (voted).
# This enables us to check if a user, who is verified, has already reacted (voted) on a reactable,
# perhaps as different user (different account, using same verification ID, with the user account subsequently deleted).
# This is only relevant when verification is required to react (vote).

# == Schema Information
#
# Table name: verification_reactions_verifications_hashed_uids
#
#  id                      :uuid             not null, primary key
#  reaction_id             :uuid
#  verification_hashed_uid :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_on_reaction_id              (reaction_id)
#  index_on_verification_hashed_uid  (verification_hashed_uid)
#
# Foreign Keys
#
#  fk_rails_...  (reaction_id => reactions.id)
#
module Verification
  class ReactionsVerificationsHashedUid < ApplicationRecord
    belongs_to :reaction

    validates :verification_hashed_uid, presence: true
  end
end
