FactoryBot.define do
  factory :clustering, class: Clusterings::Clustering do
    title_multiloc {{
      "en": "Ideas overview #1"
    }}
    structure {{
      "type" => "custom",
      "title" => "My first cluster",
      "id" => SecureRandom.uuid,
      "children" => [
        {
          "type" => "idea",
          "id" => create(:idea).id
        }
      ]
    }}
  end
end
