class RecreateVersionsJob < ApplicationJob
  queue_as :default
  perform_retries false # to prevent extensive AWS lambda usage https://www.notion.so/citizenlab/Images-and-uploads-235125ffc7824a2493b7fd7d42b3b926

  def run(instance, attribute)
    Rails.logger.info(
      "Recreating #{AppConfiguration.instance.name} #{instance.class.name} #{instance.id} #{attribute} versions"
    )
    begin
      return unless instance.valid? && instance.send("#{attribute}?")

      instance.send(attribute).recreate_versions!
      instance.save!
    rescue NoMethodError
      # Needed to get past this bug https://github.com/carrierwaveuploader/carrierwave/issues/828
      Rails.logger.debug('Something went wrong, recreate_version failed!')
    end
  end
end
