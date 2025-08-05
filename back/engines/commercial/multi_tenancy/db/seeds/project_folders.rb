# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class ProjectFolders < Base
      def run
        2.times do
          folder = ::ProjectFolders::Folder.create!( # TODO: move to ProjectFolders engine
            title_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: runner.rand_description_multiloc,
            description_preview_multiloc: runner.create_for_tenant_locales { Faker::Lorem.sentence },
            header_bg: rand(25) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open,
            admin_publication_attributes: {
              publication_status: %w[published published published published published draft
                archived][rand(7)]
            }
          )

          unless rand(25) == 0
            ::ProjectFolders::Image.create!({ project_folder_id: folder.id,
              image: Rails.root.join("spec/fixtures/image#{rand(20)}.jpg").open })
          end

          rand(1..3).times do
            folder.files.create!(runner.generate_file_attributes)
          end
        end
      end
    end
  end
end
