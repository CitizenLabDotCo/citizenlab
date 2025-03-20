# frozen_string_literal: true

FactoryBot.define do
  factory :value_bin, class: 'CustomFieldBins::ValueBin' do
    association :custom_field, factory: :custom_field_linear_scale
    values { [1] }
  end

  factory :option_bin, class: 'CustomFieldBins::OptionBin' do
    association :custom_field, factory: :custom_field_select

    after(:build) do |option_bin, _evaluator|
      option_bin.custom_field_option ||= create(:custom_field_option, custom_field: option_bin.custom_field)
    end
  end
end
