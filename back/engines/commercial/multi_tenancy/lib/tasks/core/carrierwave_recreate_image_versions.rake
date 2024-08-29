# frozen_string_literal: true

namespace :carrierwave do
  desc 'Recreate images when versions have changed'
  # See https://www.notion.so/citizenlab/Images-and-uploads-235125ffc7824a2493b7fd7d42b3b926#7d5db1f725dd4f68b0b2459fcf80ffc6
  # to understand how and why it works.
  #
  # How to use:
  # It need MODEL_CONFIGS env variable which is a JSON array of objects with class and attributes (includes versions) keys.
  #
  # 1. Recreates:
  #    - all versions of ProjectImage#image
  # docker exec -it -e MODEL_CONFIGS='[{"class": "ProjectImage", "attributes": { "image": [] } }]' "$(docker ps | awk '/web/ {print $1}' | head -1)" bin/rails carrierwave:recreate_image_versions
  #
  # 2. Recreates
  #    - all versions of ProjectImage#image
  #    - all versions of ProjectFolders::Image#image
  # docker exec -it -e MODEL_CONFIGS='[{"class": "ProjectImage", "attributes": { "image": [] } }, {"class": "ProjectFolders::Image", "attributes": { "image": [] } }]' "$(docker ps | awk '/web/ {print $1}' | head -1)" bin/rails carrierwave:recreate_image_versions
  #
  # 3. Recreates:
  #    - small and medium versions of AppConfiguration#logo
  #    - all versions of AppConfiguration#favicon
  #    - all versions of ProjectImage#image
  # docker exec -it -e MODEL_CONFIGS='[{"class": "AppConfiguration", "attributes": { "logo": ["small", "medium"], "favicon": [] } }, {"class": "ProjectImage", "attributes": { "image": [] } }]' "$(docker ps | awk '/web/ {print $1}' | head -1)" bin/rails carrierwave:recreate_image_versions
  #
  task recreate_image_versions: :environment do
    Tenant.safe_switch_each do |tenant|
      puts("Enqueueing #{tenant.host} RecreateVersionsJob")

      JSON.parse(ENV.fetch('MODEL_CONFIGS')).each do |model_config|
        model = model_config['class'].constantize
        attributes_and_versions = model_config['attributes']

        puts "Enqueueing #{model} - #{attributes_and_versions}"

        model.find_each do |instance|
          print '.'
          attributes_and_versions.each do |attribute, versions|
            RecreateVersionsJob.perform_later(instance, attribute, versions)
          end
        end

        puts
        puts "Finished #{model}"
      end
    end
  end
end
