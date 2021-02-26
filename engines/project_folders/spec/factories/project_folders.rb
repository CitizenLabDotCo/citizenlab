FactoryBot.define do
  factory :project_folder, class: ProjectFolders::Folder do
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

    transient do
      projects { nil }
    end

    after(:create) do |folder, evaluator|
      if evaluator.projects
        AdminPublication.where(publication: evaluator.projects)
          .update_all(parent_id: folder.admin_publication.id)
      end
    end
  end
end
