# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_date_sept, class: 'Analytics::DimensionDate' do
    date { '2022-09-01' }
    year { '2022' }
    month { '2022-09' }
    week { '2022-08-29' }
  end
  factory :dimension_date_aug, class: 'Analytics::DimensionDate' do
    date { '2022-08-01' }
    year { '2022' }
    month { '2022-08' }
    week { '2022-08-08' }
  end
end
