module Verification
	class Verification < ApplicationRecord
    belongs_to :user

    validates :method_name, :hashed_uid, presence: true
    validates :active, inclusion: {in: [true, false]}

    def event_bus_item_name
      "Verification by #{method_name}"
    end
	end
end