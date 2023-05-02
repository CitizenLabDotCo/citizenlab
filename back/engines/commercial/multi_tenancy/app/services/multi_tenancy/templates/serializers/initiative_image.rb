# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class InitiativeImage < Base
        ref_attribute :initiative
        upload_attribute :image
        attribute :ordering
      end
    end
  end
end
