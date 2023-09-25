# frozen_string_literal: true

FactoryBot.define do
  factory :custom_field, aliases: [:custom_field_text] do
    resource_type { 'User' }
    sequence(:key) { |n| "field_#{n}" }
    title_multiloc do
      {
        'en' => 'Did you attend'
      }
    end
    description_multiloc do
      {
        'en' => 'Which councils are you attending in our city?'
      }
    end
    required { false }
    input_type { 'text' }
    trait :for_custom_form do
      association :resource, factory: :custom_form
    end

    factory :custom_field_multiline_text do
      title_multiloc do
        {
          'en' => 'Why would you want to join the army?'
        }
      end
      description_multiloc do
        {
          'en' => 'Please explain why you want to join the army.'
        }
      end
      required { false }
      input_type { 'multiline_text' }

      trait :for_custom_form do
        association :resource, factory: :custom_form
      end
    end

    factory :custom_field_extra_custom_form do
      title_multiloc do
        {
          'en' => 'An extra question'
        }
      end
      required { false }
      key { 'extra_field' }
      input_type { 'text' }
      enabled { true }
      resource { create(:custom_form) }
    end

    factory :custom_field_select do
      title_multiloc do
        {
          'en' => 'Member of councils?'
        }
      end
      description_multiloc do
        {
          'en' => 'Which councils are you attending in our city?'
        }
      end
      required { false }
      input_type { 'select' }
      enabled { true }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'option1')
          create(:custom_field_option, custom_field: cf, key: 'option2')
        end
      end
    end

    factory :custom_field_linear_scale do
      title_multiloc do
        {
          'en' => 'We need a swimming pool.'
        }
      end
      description_multiloc do
        {
          'en' => 'Please indicate how strong you agree or disagree.'
        }
      end
      required { false }
      input_type { 'linear_scale' }
      enabled { true }
      maximum { 5 }
      minimum_label_multiloc do
        {
          'en' => 'Strongly disagree'
        }
      end
      maximum_label_multiloc do
        {
          'en' => 'Strongly agree'
        }
      end
    end

    factory :custom_field_page do
      title_multiloc do
        {
          'en' => 'Cycling survey'
        }
      end
      description_multiloc do
        {
          'en' => 'This is a survey on your cycling habits.'
        }
      end
      required { false }
      input_type { 'page' }
      enabled { true }
    end

    factory :custom_field_section do
      title_multiloc do
        {
          'en' => 'A section'
        }
      end
      description_multiloc do
        {
          'en' => 'This is a section.'
        }
      end
      required { false }
      input_type { 'section' }
      enabled { true }
    end

    factory :custom_field_multiselect do
      title_multiloc do
        {
          'en' => 'What languages do you speak?'
        }
      end
      required { false }
      input_type { 'multiselect' }
      enabled { true }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'option1')
          create(:custom_field_option, custom_field: cf, key: 'option2')
        end
      end
    end

    factory :custom_field_checkbox do
      title_multiloc do
        {
          'en' => 'I want to join the army'
        }
      end
      required { true } # default should be false, right?
      input_type { 'checkbox' }
      enabled { true }
    end

    factory :custom_field_date do
      title_multiloc do
        {
          'en' => 'When did you last see a mermaid?'
        }
      end
      required { false }
      input_type { 'date' }
      enabled { true }
    end

    factory :custom_field_number do
      title_multiloc do
        {
          'en' => 'How many cheese burgers can you put in your mouth without swallowing?'
        }
      end
      required { false }
      input_type { 'number' }
      enabled { true }
    end

    factory :custom_field_birthyear do
      key { 'birthyear' }
      title_multiloc { { en: 'birthyear' } }
      input_type { 'number' }
      code { 'birthyear' }
    end

    factory :custom_field_gender do
      key { 'gender' }
      title_multiloc { { 'en' => 'gender' } }
      code { 'gender' }
      input_type { 'select' }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: 'male')
          create(:custom_field_option, custom_field: cf, key: 'female')
          create(:custom_field_option, custom_field: cf, key: 'unspecified')
        end
      end
    end

    factory :custom_field_domicile do
      key { 'domicile' }
      title_multiloc { { 'en' => 'domicile' } }
      code { 'domicile' }
      input_type { 'select' }
    end

    factory :custom_field_education do
      key { 'education' }
      title_multiloc { { 'en' => 'education' } }
      code { 'education' }
      input_type { 'select' }
      enabled { false }

      trait :with_options do
        after(:create) do |cf|
          create(:custom_field_option, custom_field: cf, key: '2')
          create(:custom_field_option, custom_field: cf, key: '3')
          create(:custom_field_option, custom_field: cf, key: '4')
          create(:custom_field_option, custom_field: cf, key: '5')
          create(:custom_field_option, custom_field: cf, key: '6')
          create(:custom_field_option, custom_field: cf, key: '7')
          create(:custom_field_option, custom_field: cf, key: '8')
        end
      end
    end
  end
end
