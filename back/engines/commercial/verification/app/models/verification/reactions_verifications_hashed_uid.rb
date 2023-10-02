# frozen_string_literal: true

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
