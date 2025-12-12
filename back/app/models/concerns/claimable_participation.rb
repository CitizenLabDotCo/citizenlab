# frozen_string_literal: true

module ClaimableParticipation
  extend ActiveSupport::Concern

  included do
    # Using `dependent: :nullify` is sufficient since the expired token will eventually be
    # cleaned up.
    has_one :claim_token, as: :item, inverse_of: :item, dependent: :nullify
  end
end
