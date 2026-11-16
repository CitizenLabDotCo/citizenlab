# frozen_string_literal: true

class PublicApi::V2::CustomFieldMatrixStatementSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :custom_field_id,
    :key,
    :ordering,
    :created_at,
    :updated_at

  multiloc_attribute :title_multiloc
end
