# frozen_string_literal: true

require 'faker'

FactoryBot.define do
  # This is a user that has already filled out the main fields
  # and confirmed their email etc. The most commonly used user in tests.
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

    after(:build) do |user|
      user.email_confirmed_at = Time.zone.now
      user.confirmation_required = false
    end

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

    factory :sso_user do
      after(:create) do |user|
        user.identities << create(:facebook_identity, user: user)
      end
    end
  end

  # Represents a user who verified a phone number through the confirmation flow.
  # phone is only ever populated together with phone_confirmed_at,
  # so SMS campaigns (which target confirmed numbers) reach this user.
  trait :with_confirmed_phone do
    sequence(:phone) { |n| "+1#{4_155_552_000 + n}" }
    phone_confirmed_at { Time.zone.now }
  end

  # This is an unconfirmed user. This is basically the state that a user is in
  # after entering their email, while they have not yet confirmed their email,
  # and have not yet filled out any other fields. This is used in tests that need to verify the
  # auth flow for email users.
  factory :unconfirmed_user, class: 'User' do
    first_name { nil }
    last_name { nil }
    sequence(:email) do |n|
      name, domain = Faker::Internet.email.split('@')
      "#{name}#{n}@#{domain}"
    end
    locale { 'en' }
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
end
