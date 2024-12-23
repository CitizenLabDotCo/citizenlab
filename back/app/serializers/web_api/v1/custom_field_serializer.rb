# frozen_string_literal: true

class WebApi::V1::CustomFieldSerializer < WebApi::V1::BaseSerializer
  attributes :key, :input_type, :title_multiloc, :required, :ordering,
    :enabled, :code, :created_at, :updated_at, :logic, :random_option_ordering

  attribute :description_multiloc do |field|
    TextImageService.new.render_data_images_multiloc field.description_multiloc, field: :description_multiloc, imageable: field
  end

  attribute :answer_visible_to, if: proc { |_object, params|
    params[:supports_answer_visible_to]
  }

  attribute :hidden, if: proc { |object, _params|
    object.resource_type == 'User'
  }

  attribute :page_layout, if: proc { |object, _params|
    object.input_type == 'page'
  }

  attribute :dropdown_layout, if: proc { |object, _params|
    object.dropdown_layout_type?
  }

  attribute :constraints do |object, params|
    if params[:constraints]
      params[:constraints][object.code&.to_sym] || {}
    else
      {}
    end
  end

  attributes :maximum,
    :linear_scale_label_1_multiloc,
    :linear_scale_label_2_multiloc,
    :linear_scale_label_3_multiloc,
    :linear_scale_label_4_multiloc,
    :linear_scale_label_5_multiloc,
    :linear_scale_label_6_multiloc,
    :linear_scale_label_7_multiloc,
    if: proc { |object, _params| object.linear_scale? }

  attributes :select_count_enabled, :maximum_select_count, :minimum_select_count, if: proc { |object, _params|
    object.multiselect?
  }

  has_many :options, record_type: :custom_field_option, serializer: ::WebApi::V1::CustomFieldOptionSerializer
  has_one :resource, record_type: :custom_form, serializer: ::WebApi::V1::CustomFormSerializer
end

WebApi::V1::CustomFieldSerializer.include(CustomMaps::Extensions::WebApi::V1::CustomFieldSerializer)
