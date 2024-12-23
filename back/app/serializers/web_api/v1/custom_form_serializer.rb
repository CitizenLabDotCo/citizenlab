# frozen_string_literal: true

class WebApi::V1::CustomFormSerializer < WebApi::V1::BaseSerializer
  attributes :updated_at
  attribute :opened_at do |_object|
    Time.zone.now.to_fs(:db) # TODO: JS - not quite the same as coming from the db
  end
end
