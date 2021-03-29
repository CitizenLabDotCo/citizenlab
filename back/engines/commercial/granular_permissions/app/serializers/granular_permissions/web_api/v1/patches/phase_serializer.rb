# frozen_string_literal: true

module GranularPermissions
  module WebApi
    module V1
      module Patches
        module PhaseSerializer
          def self.included(base)
            base.class_eval { has_many :permissions }
          end
        end
      end
    end
  end
end
