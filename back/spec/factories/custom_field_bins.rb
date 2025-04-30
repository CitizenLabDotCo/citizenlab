# frozen_string_literal: true

FactoryBot.define do
  factory :value_bin, class: 'CustomFieldBins::ValueBin' do
    association :custom_field, factory: :custom_field_linear_scale
    values { [1] }
  end

  factory :option_bin, class: 'CustomFieldBins::OptionBin' do
    association :custom_field, factory: :custom_field_select

    transient do
      option_attrs { {} }
    end

    after(:build) do |option_bin, evaluator|
      option_bin.custom_field_option ||= create(
        :custom_field_option,
        { custom_field: option_bin.custom_field }.merge(evaluator.option_attrs)
      )
    end
  end

  factory :range_bin, class: 'CustomFieldBins::RangeBin' do
    association :custom_field, factory: :custom_field_number
    range { 1...10 }
  end

  factory :age_bin, class: 'CustomFieldBins::AgeBin' do
    association :custom_field, factory: :custom_field_birthyear
    range { 20...40 }
  end
end
