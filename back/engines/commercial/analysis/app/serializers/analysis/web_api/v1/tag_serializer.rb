# frozen_string_literal: true

class Analysis::WebApi::V1::TagSerializer < WebApi::V1::BaseSerializer
  attributes :created_at, :updated_at, :tag_type, :name
  belongs_to :analysis, class_name: 'Analysis::Analysis'

  attribute :total_input_count do |tag, params|
    params[:inputs_count_by_tag][tag.id] || 0
  end

  attribute :filtered_input_count do |tag, params|
    params[:filtered_inputs_count_by_tag][tag.id] || 0
  end
end
