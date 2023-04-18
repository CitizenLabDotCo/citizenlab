# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class EventFile < Base
        ref_attribute :event
        upload_attribute :file
        attributes %i[name ordering]
      end
    end
  end
end
