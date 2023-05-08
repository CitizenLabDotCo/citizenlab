# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class CustomForm < Base
        ref_attribute :participation_context
      end
    end
  end
end
