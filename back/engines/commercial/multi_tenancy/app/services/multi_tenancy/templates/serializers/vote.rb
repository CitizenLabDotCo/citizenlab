# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Vote < Base
        ref_attributes %i[user votable]
        attribute :mode
      end
    end
  end
end
