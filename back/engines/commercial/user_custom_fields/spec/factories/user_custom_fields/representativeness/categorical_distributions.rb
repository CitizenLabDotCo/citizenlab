# frozen_string_literal: true

FactoryBot.define do
  factory :categorical_distribution, class: 'UserCustomFields::Representativeness::CategoricalDistribution' do
    transient do
      population_counts { [450, 550] }
    end

    custom_field do
      # We use 'create' instead of 'association' because in any case we need the
      # identifiers of custom field options to define the distribution. So, the options
      # must be persisted before creating the distribution.
      create(:custom_field_select, resource_type: 'User').tap do |custom_field|
        population_counts.each do
          create(:custom_field_option, custom_field: custom_field)
        end
      end
    end

    distribution do
      custom_field.option_ids.zip(population_counts.cycle).to_h
    end
  end
end
