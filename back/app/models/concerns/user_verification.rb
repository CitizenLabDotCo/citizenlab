# frozen_string_literal: true

module UserVerification
  extend ActiveSupport::Concern

  included do
    validates :verified, inclusion: { in: [true, false] }
    has_many :verifications, class_name: 'Verification::Verification', dependent: :destroy
  end
end
