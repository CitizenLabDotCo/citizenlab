FactoryBot.define do
  factory :project_folder do
    title_multiloc {{
      "en" => "All things swimming pools",
      "nl-BE" => "Alles rond zwembaden"
    }}
    description_multiloc {{
      "en" => "<p>A <i>swimming pool</i> is a pool where people swim. Unless they can't swim.</p>",
      "nl-BE" => "<p>Een <i>zwembad</i> is een bad waar mensen kunnen zwemmen. Tenzij ze niet kunnen zwemmen.</p>",
    }}
    description_preview_multiloc {{
      "en" => "<p>A <i>swimming pool</i> is a pool where people swim. Unless they can't swim.</p>",
      "nl-BE" => "<p>Een <i>zwembad</i> is een bad waar mensen kunnen zwemmen. Tenzij ze niet kunnen zwemmen.</p>",
    }}
    sequence(:slug) {|n| "swimming-pools-#{n}"}
  end
end