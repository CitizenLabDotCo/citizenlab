# frozen_string_literal: true

class Analysis::WebApi::V1::TagSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :tag_type, :name
  belongs_to :analysis, class_name: 'Analysis::Analysis'
end
