# frozen_string_literal: true

FactoryBot.define do
  factory :binned_distribution, class: 'UserCustomFields::Representativeness::BinnedDistribution' do
    transient do
      bins { [18, 35, 75, nil] }
      counts { [100, 200, 300] }
    end

    custom_field do
      CustomField.find_by(key: 'birthyear') || association(:custom_field_birthyear)
    end

    distribution do
      { 'bins' => bins, 'counts' => counts }
    end
  end
end
