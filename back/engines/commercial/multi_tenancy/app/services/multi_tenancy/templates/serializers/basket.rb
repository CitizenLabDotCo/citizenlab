# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Basket < Base
        ref_attributes %i[participation_context user]
        attribute(:submitted_at) { |basket| serialize_timestamp(basket.submitted_at) }
      end
    end
  end
end
