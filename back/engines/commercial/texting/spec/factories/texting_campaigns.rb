# frozen_string_literal: true

FactoryBot.define do
  factory :texting_campaign, class: 'Texting::Campaign' do
    phone_numbers { ['+12345678912'] }
    message { 'Hello World!' }
    status { 'draft' }
  end
end
