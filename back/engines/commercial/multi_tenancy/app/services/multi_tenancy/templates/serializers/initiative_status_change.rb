# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InitiativeStatusChange < Base
        ref_attributes %i[initiative initiative_status]
      end
    end
  end
end
