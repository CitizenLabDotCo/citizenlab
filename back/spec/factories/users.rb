# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  factory :user, aliases: %i[author recipient initiating_user] do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    sequence(:email) do |n|
      name, domain = Faker::Internet.email.split('@')
      "#{name}#{n}@#{domain}"
    end
    password { 'democracy2.0' }
    roles { [] }
    locale { 'en' }
    registration_completed_at { Time.now }
    # Although the avatar is not part of the minimal model, generating it
    # really slows down the tests, so we fix it here
    avatar { Rails.root.join('spec/fixtures/robot.jpg').open }
    invite_status { nil }

    after(:build, &:confirm)

    factory :admin do
      roles { [{ type: 'admin' }] }

      factory :super_admin do
        sequence(:email) do |n|
          "#{Faker::Name.first_name}.#{Faker::Name.last_name}-#{n}@govocal.com"
        end
      end

      trait :project_reviewer do
        roles { [{ type: 'admin', project_reviewer: true }] }
      end
    end

    factory :user_with_demographics do
      gender { ['male', 'female', 'unspecified', nil][rand(4)] }
      birthyear { rand(2) == 0 ? (Time.now.year - 12 - rand(100)) : nil }
    end
  end

  factory :unconfirmed_user, class: 'User' do
    first_name { nil }
    last_name { nil }
    sequence(:email) do |n|
      name, domain = Faker::Internet.email.split('@')
      "#{name}#{n}@#{domain}"
    end
    password { nil }
    roles { [] }
    locale { 'en' }
    registration_completed_at { nil }
    # Although the avatar is not part of the minimal model, generating it
    # really slows down the tests, so we fix it here
    avatar { nil }
    invite_status { nil }
  end

  factory :invited_user, class: 'User' do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    sequence(:email) do |n|
      name, domain = Faker::Internet.email.split('@')
      "#{name}#{n}@#{domain}"
    end
    locale { 'en' }
    invite_status { 'pending' }

    after(:create) do |user, _evaluator|
      create(:invite, invitee: user)
    end
  end

  factory :user_no_password, class: 'User' do
    sequence(:email) do |n|
      name, domain = Faker::Internet.email.split('@')
      "#{name}#{n}@#{domain}"
    end
    locale { 'en' }

    after(:create) do |user, _evaluator|
      user.reset_confirmation_code!
    end
  end
end
