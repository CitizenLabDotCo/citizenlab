# frozen_string_literal: true

class DeleteOrphanedTextImagesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [Project,NilClass] resource
  # @param [User,NilClass] current_user
  def run(resource, _current_user)
    return unless resource.class.exists?(resource.id)

    resource_as_json = resource.to_json

    resource.text_images.each do |image|
      text_image.destroy! unless resource_as_json.include?(image.text_reference)

      # Add LogActivityJob
    end
  end
end
