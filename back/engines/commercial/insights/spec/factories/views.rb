# frozen_string_literal: true

FactoryBot.define do
  factory :view, class: 'Insights::View' do
    sequence(:name) { |n| "view_#{n}" }
    data_sources { [association(:data_source, view: instance)] }
  end
end
