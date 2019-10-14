module Verification
	class Verification < ApplicationRecord
    belongs_to :user

    validates :method_name, :hashed_uid, presence: true
    validates :active, inclusion: {in: [true, false]}

    scope :with_verification_method, -> (method) {where(method_name: method.name)}
	end
end