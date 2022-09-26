# frozen_string_literal: true

FactoryBot.define do
  factory :dimension_date_first, class: 'Analytics::DimensionDate' do
    date { '2022-09-01' }
    year { '2022' }
    month { '2022-09' }
    week { '2022-08-29' }
  end
  factory :dimension_date_last, class: 'Analytics::DimensionDate' do
    date { '2022-09-02' }
    year { '2022' }
    month { '2022-09' }
    week { '2022-08-29' }
  end
end
