# frozen_string_literal: true

FactoryBot.define do
  factory :project_folder, class: 'ProjectFolders::Folder' do
    title_multiloc do
      {
        'en' => 'All things swimming pools',
        'nl-BE' => 'Alles rond zwembaden'
      }
    end
    description_multiloc do
      {
        'en' => "<p>A <i>swimming pool</i> is a pool where people swim. Unless they can't swim.</p>",
        'nl-BE' => '<p>Een <i>zwembad</i> is een bad waar mensen kunnen zwemmen. Tenzij ze niet kunnen zwemmen.</p>'
      }
    end
    description_preview_multiloc do
      {
        'en' => "<p>A <i>swimming pool</i> is a pool where people swim. Unless they can't swim.</p>",
        'nl-BE' => '<p>Een <i>zwembad</i> is een bad waar mensen kunnen zwemmen. Tenzij ze niet kunnen zwemmen.</p>'
      }
    end
    sequence(:slug) { |n| "swimming-pools-#{n}" }

    transient do
      projects { nil }
    end

    after(:create) do |folder, evaluator|
      if evaluator.projects
        AdminPublication
          .where(publication: evaluator.projects)
          .update(parent_id: folder.admin_publication.id)

        # Reloading projects to ensure that the changes are reflected in the
        # `project.folder` attribute.
        Array
          .wrap(evaluator.projects)
          .select(&:persisted?)
          .each(&:reload)
      end
    end
  end
end
