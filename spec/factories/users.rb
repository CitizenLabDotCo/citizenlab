require 'faker'

FactoryGirl.define do
  factory :user, aliases: [:author] do
    name Faker::Name.name
    email Faker::Internet.email
    password_digest "testtest"
    services {}
    demographics {}
    roles []
  end
end
