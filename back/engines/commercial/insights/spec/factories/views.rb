# frozen_string_literal: true

FactoryBot.define do
  factory :empty_view, class: 'Insights::View' do
    sequence(:name) { |n| "view_#{n}" }

    factory :view, class: 'Insights::View' do
      transient do
        scope { nil }
        nb_data_sources { 1 }
      end

      data_sources do
        if scope.present?
          [association(:data_source, view: instance, origin: scope)]
        else
          Array.new(nb_data_sources) { association(:data_source, view: instance)}
        end
      end
    end
  end
end
