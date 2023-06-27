# frozen_string_literal: true

FactoryBot.define do
  factory :experiment do
    name { 'Button location' }
    treatment { 'Left' }
    action { 'Button clicked' }
  end
end
