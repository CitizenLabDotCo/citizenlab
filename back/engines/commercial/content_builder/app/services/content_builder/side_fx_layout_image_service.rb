# frozen_string_literal: true

module ContentBuilder
  class SideFxLayoutImageService
    include SideFxHelper

    def before_create(image, user); end

    def after_create(image, user)
      LogActivityJob.perform_later image, 'created', user, image.created_at.to_i
    end
  end
end
