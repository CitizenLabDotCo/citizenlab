require 'faker'

FactoryGirl.define do
  factory :tenant do
    name Faker::Address.city
    # host Faker::Internet.domain_name
    host "localhost"
    features []
    settings {}
  end
end
