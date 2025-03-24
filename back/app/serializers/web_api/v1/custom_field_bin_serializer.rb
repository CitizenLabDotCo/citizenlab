# frozen_string_literal: true

class WebApi::V1::CustomFieldBinSerializer < WebApi::V1::BaseSerializer
  attributes :type, :values, :created_at, :updated_at

  belongs_to :custom_field
  belongs_to :custom_field_option, optional: true

  attribute :range do |object|
    object.range && { begin: object.range.begin, end: object.range.end }
  end
end
