class RecreateVersionsJob < ApplicationJob
  queue_as :default
  perform_retries false # to prevent extensive AWS lambda usage https://www.notion.so/citizenlab/Images-and-uploads-235125ffc7824a2493b7fd7d42b3b926

  def run(instance, attribute, versions = [])
    Rails.logger.info(
      "Recreating #{AppConfiguration.instance.name} #{instance.class.name} #{instance.id} #{attribute} versions"
    )
    return unless instance.valid? && instance.send("#{attribute}?")

    instance.send(attribute).recreate_versions!(*versions)
    instance.save!
  end
end
