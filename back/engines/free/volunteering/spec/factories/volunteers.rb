# frozen_string_literal: true

FactoryBot.define do
  factory :volunteer, class: 'Volunteering::Volunteer' do
    cause { create(:cause) }
    user
  end
end
