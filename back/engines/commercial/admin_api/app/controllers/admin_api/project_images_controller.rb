# frozen_string_literal: true

module AdminApi
  class ProjectImagesController < AdminApiController
    def project_image_url
      # Assuming that there is only one image per project,
      # even though the model allows for multiple images.
      project_image = ProjectImage.find_by(project_id: params[:id])

      if project_image && project_image.image && project_image.image.file
        url = nil

        if project_image.image.file.respond_to?(:url)
          url = project_image.image.file.url
        elsif Rails.env.development? # In development, the file is stored locally
          if project_image.image.file.respond_to?(:path)
            path = project_image.image.file.path
            url = "http://localhost:3000/#{path.split('public/').last}" if path
          end
        end
        render json: { url: url }
      else
        head :not_found
      end
    end
  end
end
