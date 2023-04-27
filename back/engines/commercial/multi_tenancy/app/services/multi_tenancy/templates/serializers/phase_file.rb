# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class PhaseFile < Base
        ref_attribute :phase
        upload_attribute :file
        attributes %i[name ordering]
      end
    end
  end
end
