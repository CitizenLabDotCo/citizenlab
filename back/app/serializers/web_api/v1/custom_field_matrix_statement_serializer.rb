class WebApi::V1::CustomFieldMatrixStatementSerializer < WebApi::V1::BaseSerializer
  attributes :key, :title_multiloc, :ordering, :created_at, :updated_at

  attribute :temp_id, if: proc { |object|
    object.temp_id.present?
  }
end
