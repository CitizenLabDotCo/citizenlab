# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_date, class: 'Analytics::DimensionDate' do
    sequence(:date) { |n| Date.new(2022, 9, 1) + n.days }
    year { date.year }
    month { "#{date.year}-#{date.strftime('%m')}" }
    week { date.beginning_of_week.to_date }
  end
end
