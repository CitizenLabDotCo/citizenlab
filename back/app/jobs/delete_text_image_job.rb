# frozen_string_literal: true

class DeleteTextImageJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [TextImage] text_image
  # @param [User,NilClass] current_user
  def run(text_image, _current_user)
    text_image.destroy! if TextImage.find_by(id: text_image.id)

    # Add LogActivityJob
  end
end
