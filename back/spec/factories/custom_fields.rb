FactoryBot.define do
  factory :custom_field do
    resource_type { "User" }
    sequence(:key) { |n| "field_#{n}" }
    title_multiloc {{
      "en" => "Did you attend"
    }}
    description_multiloc {{
      "en" => "Which councils are you attending in our city?"  
    }}
    required { false }
    input_type { "text" }

    trait :for_custom_form do
      association :resource, factory: :custom_form
    end

    factory :custom_field_select do
      title_multiloc {{
        "en" => "Member of councils?"
      }}
      description_multiloc {{
        "en" => "Which councils are you attending in our city?"  
      }}
      required { false }
      input_type { "select" }
      enabled { true }
    end

    factory :custom_field_multiselect do
      title_multiloc {{
        "en" => "What languages do you speak?"
      }}
      required { false }
      input_type { "multiselect" }
      enabled { true }
    end

    factory :custom_field_checkbox do
      title_multiloc {{
        "en" => "I want to join the army"
      }}
      required { true } # default should be false, right?
      input_type { "checkbox" }
      enabled { true }
    end

    factory :custom_field_date do
      title_multiloc {{
        "en" => "When did you last see a mermaid?"
      }}
      required { false }
      input_type { "date" }
      enabled { true }
    end

    factory :custom_field_number do
      title_multiloc {{
        "en" => "How many cheese burgers can you put in your mouth without swallowing?"
      }}
      required { false }
      input_type { "number" }
      enabled { true }
    end

    factory :custom_field_birthyear do
      key { 'birthyear' }
      title_multiloc { {en: 'birthyear' } }
      input_type { 'number' }
      code { 'birthyear' }
    end

    factory :custom_field_gender do
      key { 'gender' }
      title_multiloc { {'en' => 'gender'} }
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
      title_multiloc { {'en' => 'domicile'} }
      code { 'domicile' }
      input_type { 'select' }
    end

    factory :custom_field_education do
      key { 'education' }
      title_multiloc { {'en' => 'education'} }
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
