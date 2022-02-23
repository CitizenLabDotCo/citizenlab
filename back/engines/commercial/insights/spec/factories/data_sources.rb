# frozen_string_literal: true

FactoryBot.define do
  factory :data_source, class: 'Insights::DataSource' do
    view
    origin factory: :project
  end
end
