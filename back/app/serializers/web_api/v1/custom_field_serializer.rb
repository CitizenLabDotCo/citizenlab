# frozen_string_literal: true

class WebApi::V1::CustomFieldSerializer < WebApi::V1::BaseSerializer
  attributes :key, :input_type, :title_multiloc, :required, :ordering, :enabled, :code, :created_at, :updated_at

  attribute :description_multiloc do |field|
    TextImageService.new.render_data_images field, :description_multiloc
  end

  attribute :hidden, if: proc { |object, _params|
    object.resource_type == 'User'
  }

  attributes :maximum, :minimum_label_multiloc, :maximum_label_multiloc, if: proc { |object, _params|
    object.input_type == 'linear_scale'
  }

  has_many :options, record_type: :custom_field_option, serializer: ::WebApi::V1::CustomFieldOptionSerializer
end
