# frozen_string_literal: true

class WebApi::V1::CustomFormSerializer < WebApi::V1::BaseSerializer
  attributes :updated_at
  attribute :opened_at do |_object|
    Time.zone.now.strftime('%Y-%m-%dT%H:%M:%S.%LZ') # Same format as updated_at
  end
end
