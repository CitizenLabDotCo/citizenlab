# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class EventImage < Base
        ref_attribute :event
        upload_attribute :image
        attribute :ordering
      end
    end
  end
end
