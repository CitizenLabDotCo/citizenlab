# frozen_string_literal: true

module ClaimableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :claim_token, as: :item, inverse_of: :item, dependent: :destroy
  end
end
