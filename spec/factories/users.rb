require 'faker'

FactoryGirl.define do
  factory :user, aliases: [:author] do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.email }
    password_digest "testtest"
    services {}
    demographics {}
    roles []
    locale "en"

    factory :admin do
      roles [{type: 'admin'}]
    end
  end

end
