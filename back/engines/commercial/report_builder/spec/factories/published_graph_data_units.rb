# frozen_string_literal: true

FactoryBot.define do
  factory :published_graph_data_unit, class: 'ReportBuilder::PublishedGraphDataUnit' do
    report { build(:report, phase: build(:phase)) }
    graph_id { 'gJxirq8X7m' }
    data do
      [{
        'count' => 1,
        'dimension_date_created.month' => '2022-09'
      }]
    end
  end
end
