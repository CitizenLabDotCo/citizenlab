# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class AdminPublication < Base
        ref_attributes %i[parent publication]
        attributes %i[ordering publication_status]
      end
    end
  end
end
