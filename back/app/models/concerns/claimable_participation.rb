# frozen_string_literal: true

module ClaimableParticipation
  extend ActiveSupport::Concern

  included do
    # Using `dependent: :nullify` is sufficient since the expired token will eventually be
    # cleaned up. Anyway, this affects only rare edge cases and isn't something to worry
    # about too much.
    has_one :claim_token, as: :item, dependent: :nullify
  end
end
