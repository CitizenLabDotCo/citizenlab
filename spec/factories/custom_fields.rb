FactoryBot.define do
  factory :custom_field do
    resource_type "User"
    sequence(:key) { |n| "field_#{n}" }
    title_multiloc {{
      "en" => "Did you attend"
    }}
    description_multiloc {{
      "en" => "Which councils are you attending in our city?"  
    }}
    required false
    input_type "text"

    factory :custom_field_select do
      title_multiloc {{
        "en" => "Member of councils?"
      }}
      description_multiloc {{
        "en" => "Which councils are you attending in our city?"  
      }}
      required false
      input_type "select"
      enabled true
    end

    factory :custom_field_multiselect do
      title_multiloc {{
        "en" => "What languages do you speak?"
      }}
      required false
      input_type "multiselect"
      enabled true
    end

    factory :custom_field_checkbox do
      title_multiloc {{
        "en" => "I want to join the army"
      }}
      required true # default should be false, right?
      input_type "checkbox"
      enabled true
    end

    factory :custom_field_date do
      title_multiloc {{
        "en" => "When did you last see a mermaid?"
      }}
      required false
      input_type "date"
      enabled true
    end

    factory :custom_field_number do
      title_multiloc {{
        "en" => "How many cheese burgers can you put in your mouth without swallowing?"
      }}
      required false
      input_type "number"
      enabled true
    end

  end
end
