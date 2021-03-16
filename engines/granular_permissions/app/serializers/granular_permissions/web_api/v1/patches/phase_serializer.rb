# frozen_string_literal: true

module GranularPermissions
  module WebApi
    module V1
      module Patches
        module PhaseSerializer
          def self.included(_base)
            has_many :permissions
          end
        end
      end
    end
  end
end
