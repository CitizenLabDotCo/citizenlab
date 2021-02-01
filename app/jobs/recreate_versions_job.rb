class RecreateVersionsJob < ApplicationJob
  queue_as :image_background

  def perform(instance, attribute)
    puts "Recreating #{AppConfiguration.instance.name} #{instance.class.name} #{instance.id} #{attribute} versions"
    begin
      if instance.valid? && instance.send("#{attribute}?")
        instance.send(attribute).recreate_versions!
        instance.save!
      end
    rescue NoMethodError
      # Needed to get past this bug https://github.com/carrierwaveuploader/carrierwave/issues/828
      puts "Something went wrong, recreate_version failed!"
    end
  end
end
