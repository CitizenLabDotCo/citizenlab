# frozen_string_literal: true

module AdminApi
  class ProjectSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :description_multiloc,
      :slug,
      :map_config_id,
      :image_path, # Used by project library
      :visible_to,
      :created_at,
      :updated_at

    has_one :admin_publication
    has_one :folder

    def image_path
      first_image = object&.project_images&.first
      return nil unless first_image

      file = first_image&.image&.file
      return nil unless file.respond_to?(:path)

      file.path&.split('public/')&.last
    end

    class AdminPublicationSerializer < ActiveModel::Serializer
      attributes :id, :publication_status

      attribute :parent_publication_status # Used by project library

      def parent_publication_status
        object.parent&.publication_status
      end
    end

    class FolderSerializer < ActiveModel::Serializer
      attributes :id, :title_multiloc, :description_multiloc, :slug
    end
  end
end
