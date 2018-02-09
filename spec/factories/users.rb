require 'faker'

FactoryBot.define do
  factory :user, aliases: [:author, :recipient, :initiating_user] do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.email }
    password_digest "testtest"
    demographics {}
    roles []
    locale "en"
    # Although the avatar is not part of the minimal model, generating it
    # really slows down the tests, so we fix it here
    avatar File.open(Rails.root.join("spec/fixtures/robot.jpg"))

    factory :admin do
      roles [{type: 'admin'}]
    end

    factory :user_with_demographics do
      gender { ['male','female','unspecified',nil][rand(4)] }
      birthyear { rand(1)==0 ? Time.now.year - 1 - rand(100) : nil }
      education { rand(1)==0 ? rand(8)+1 : nil }
    end

  end

end
