# frozen_string_literal: true

FactoryBot.define do
  factory :empty_view, class: 'Insights::View' do
    sequence(:name) { |n| "view_#{n}" }

    factory :view, class: 'Insights::View' do
      transient do
        nb_data_sources { 1 }
      end

      data_sources do
        Array.new(nb_data_sources) { association(:data_source, view: instance) }
      end

      factory :view_from_projects do
        transient do
          projects { [] }
        end

        data_sources do
          raise ArgumentError, 'Provide at least 1 project' if projects.empty?

          projects.map do |project|
            association(:data_source, view: instance, origin: project)
          end
        end
      end
    end
  end
end
