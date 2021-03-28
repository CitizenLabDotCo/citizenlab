FactoryBot.define do
  factory :initiative_status do
    title_multiloc {{
      "en" => "Made Joke cry",
      "nl-BE" => "Deed Joke wenen"
    }}
    ordering { 2 }
    code { "custom" }
    color { "#AABBCC" }
    description_multiloc {{
      "en" => "This initiative has made Joke cry",
      "nl-BE" => "Het initiatief heeft Joke doen wenen"
    }}

    factory :initiative_status_proposed do
      code { 'proposed' }
      title_multiloc { {'en' => 'proposed'} }
    end

    factory :initiative_status_expired do
      code { 'expired' }
      title_multiloc { {'en' => 'expired'} }
    end

    factory :initiative_status_threshold_reached do
      code { 'threshold_reached' }
      title_multiloc { {'en' => 'threshold_reached'} }
    end

    factory :initiative_status_answered do
      code { 'answered' }
      title_multiloc { {'en' => 'answered'} }
    end

    factory :initiative_status_ineligible do
      code { 'ineligible' }
      title_multiloc { {'en' => 'ineligible'} }
    end
  end
end
