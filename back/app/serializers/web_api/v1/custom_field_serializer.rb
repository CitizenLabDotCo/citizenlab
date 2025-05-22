# frozen_string_literal: true

class WebApi::V1::CustomFieldSerializer < WebApi::V1::BaseSerializer
  attributes :key, :input_type, :title_multiloc, :required, :ordering,
    :enabled, :code, :created_at, :updated_at, :logic, :random_option_ordering, :include_in_printed_form

  attribute :description_multiloc do |field|
    TextImageService.new.render_data_images_multiloc field.description_multiloc, field: :description_multiloc, imageable: field
  end

  attribute :visible_to_public, if: proc { |_field, params|
    params[:supports_answer_visible_to]
  } do |field|
    field.visible_to_public?
  end

  attribute :hidden, if: proc { |object, _params|
    object.resource_type == 'User'
  }

  attribute :page_layout, if: proc { |object, _params|
    object.input_type == 'page'
  }

  attribute :page_button_link, if: proc { |object, _params|
    object.form_end_page?
  }

  attribute :page_button_label_multiloc, if: proc { |object, _params|
    object.form_end_page?
  }

  attribute :dropdown_layout, if: proc { |object, _params|
    object.dropdown_layout_type?
  }

  attribute :ask_follow_up, if: proc { |object, _params|
    object.input_type == 'sentiment_linear_scale'
  }

  attribute :constraints do |object, params|
    if params[:constraints]
      params[:constraints][object.code&.to_sym] || {}
    else
      {}
    end
  end

  attribute :maximum, if: proc { |object, _params|
    object.supports_linear_scale?
  }

  attribute :question_category, if: proc { |object, _params|
    object.supports_category?
  }

  attributes :linear_scale_label_1_multiloc,
    :linear_scale_label_2_multiloc,
    :linear_scale_label_3_multiloc,
    :linear_scale_label_4_multiloc,
    :linear_scale_label_5_multiloc,
    :linear_scale_label_6_multiloc,
    :linear_scale_label_7_multiloc,
    :linear_scale_label_8_multiloc,
    :linear_scale_label_9_multiloc,
    :linear_scale_label_10_multiloc,
    :linear_scale_label_11_multiloc,
    if: proc { |object, _params| object.supports_linear_scale_labels? }

  attributes :select_count_enabled, :maximum_select_count, :minimum_select_count, if: proc { |object, _params|
    object.multiselect?
  }

  has_many :options, record_type: :custom_field_option, serializer: ::WebApi::V1::CustomFieldOptionSerializer
  has_many :matrix_statements, record_type: :custom_field_matrix_statement, serializer: ::WebApi::V1::CustomFieldMatrixStatementSerializer, if: proc { |field|
    field.supports_matrix_statements?
  }
  has_one :resource, record_type: :custom_form, serializer: ::WebApi::V1::CustomFormSerializer
end

WebApi::V1::CustomFieldSerializer.include(CustomMaps::Extensions::WebApi::V1::CustomFieldSerializer)
