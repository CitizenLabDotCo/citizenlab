# frozen_string_literal: true

# == Schema Information
#
# Table name: verification_verifications
#
#  id          :uuid             not null, primary key
#  user_id     :uuid
#  method_name :string           not null
#  hashed_uid  :string           not null
#  active      :boolean          default(TRUE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_verification_verifications_on_hashed_uid  (hashed_uid)
#  index_verification_verifications_on_user_id     (user_id)
#
module Verification
  class Verification < ApplicationRecord
    belongs_to :user

    validates :method_name, :hashed_uid, presence: true
    validates :active, inclusion: { in: [true, false] }

    scope :active, -> { where(active: true) }

    def event_bus_item_name
      "Verification by #{method_name}"
    end
  end
end
