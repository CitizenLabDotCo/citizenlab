# frozen_string_literal: true

FactoryBot.define do
  factory :published_graph_data_unit, class: 'ReportBuilder::PublishedGraphDataUnit' do
    report { build(:report, phase: build(:phase)) }
    graph_id { 'gJxirq8X7m' }
    data do
      [{
        'count_dimension_user_custom_field_values_dimension_user_id' => 1,
        'dimension_user_custom_field_values.value' => 'female'
      }]
    end
  end
end
