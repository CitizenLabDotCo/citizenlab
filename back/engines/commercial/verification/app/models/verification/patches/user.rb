module Verification
  module Patches
    module User
      extend ActiveSupport::Concern

      included do
        validates :verified, inclusion: { in: [true, false] }
        has_many :verifications, class_name: 'Verification::Verification', dependent: :destroy
      end

    end
  end
end