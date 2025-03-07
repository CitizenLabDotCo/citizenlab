# frozen_string_literal: true

class Analysis::WebApi::V1::HeatmapCellSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :unit, :count, :lift, :p_value, :statement_multiloc
  belongs_to :row, serializer: lambda { |object, _params|
    case object
    when CustomFieldOption
      WebApi::V1::CustomFieldOptionSerializer
    when Analysis::Tag
      Analysis::WebApi::V1::TagSerializer
    end
  }
  belongs_to :column, serializer: lambda { |object, _params|
    case object
    when CustomFieldOption
      WebApi::V1::CustomFieldOptionSerializer
    when Analysis::Tag
      Analysis::WebApi::V1::TagSerializer
    end
  }

  belongs_to :analysis, class_name: 'Analysis::Analysis'
end
