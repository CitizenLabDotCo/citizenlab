# frozen_string_literal: true

FactoryBot.define do
  factory :cosponsors_initiative do
    user
    initiative
    status { 'pending' }
  end
end
