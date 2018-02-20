FactoryBot.define do
  factory :custom_field do
    resource_type "User"
    key { "field_#{SecureRandom.hex(4)}" }
    title_multiloc {{
      "en" => "Did you attend"
    }}
    description_multiloc {{
      "en" => "Which councils are you attending in our city?"  
    }}
    required false
    input_type "text"
    ordering 1

    factory :custom_field_select do
      title_multiloc {{
        "en" => "Member of councils?"
      }}
      description_multiloc {{
        "en" => "Which councils are you attending in our city?"  
      }}
      required false
      input_type "select"
      ordering 1
    end


  end
end
