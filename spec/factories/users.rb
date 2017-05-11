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
    # Although the avatar is not part of the minimal model, generating it
    # really slows down the tests, so we fix it here
    avatar File.open(Rails.root.join("spec/fixtures/robot.jpg"))

    factory :admin do
      roles [{type: 'admin'}]
    end

  end

end
