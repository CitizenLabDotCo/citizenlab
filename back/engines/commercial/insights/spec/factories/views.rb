# frozen_string_literal: true

FactoryBot.define do
  factory :view, class: 'Insights::View' do
    sequence(:name) { |n| "view_#{n}" }
    scope { nil }
    data_sources do
      if scope.present?
        [association(:data_source, view: instance, origin: scope)]
      else
        [association(:data_source, view: instance)]
      end
    end
  end
end
