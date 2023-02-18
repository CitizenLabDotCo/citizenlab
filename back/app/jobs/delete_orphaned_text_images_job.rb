# frozen_string_literal: true

class DeleteOrphanedTextImagesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [Project,Phase,NilClass] resource
  # @param [User,NilClass] current_user
  def run(resource, user)
    return unless resource.class.exists?(resource.id)

    resource_as_json = resource.to_json

    resource.text_images.each do |image|
      next if resource_as_json.include?(image.text_reference)

      image.destroy!

      image_data = image.attributes
      LogActivityJob.perform_later(
        ['TextImage', image.id].join('/'), 'deleted_orphan',
        user, Time.now.to_i,
        payload: { text_image: image_data }
      )
    end
  end
end
