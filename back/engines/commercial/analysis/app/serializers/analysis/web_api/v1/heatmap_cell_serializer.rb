# frozen_string_literal: true

class Analysis::WebApi::V1::HeatmapCellSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :unit, :count, :lift, :p_value, :row_bin_value, :column_bin_value

  attribute :statement_multiloc do |object|
    Analysis::HeatmapCellStatementGenerator.new.generate(object)
  end

  belongs_to :row, serializer: lambda { |object, _params|
    case object
    when CustomFieldOption
      WebApi::V1::CustomFieldOptionSerializer
    when Analysis::Tag
      Analysis::WebApi::V1::TagSerializer
    when CustomField
      WebApi::V1::CustomFieldSerializer
    end
  }
  belongs_to :column, serializer: lambda { |object, _params|
    case object
    when CustomFieldOption
      WebApi::V1::CustomFieldOptionSerializer
    when Analysis::Tag
      Analysis::WebApi::V1::TagSerializer
    when CustomField
      WebApi::V1::CustomFieldSerializer
    end
  }

  belongs_to :analysis, class_name: 'Analysis::Analysis'
end
