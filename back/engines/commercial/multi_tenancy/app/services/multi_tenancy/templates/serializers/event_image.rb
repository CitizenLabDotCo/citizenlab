# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class EventImage < Base
        ref_attribute :event
        upload_attribute :image
        attributes %i[ordering alt_text_multiloc]
      end
    end
  end
end
