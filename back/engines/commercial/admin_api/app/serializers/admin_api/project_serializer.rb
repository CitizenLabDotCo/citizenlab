# frozen_string_literal: true

module AdminApi
  class ProjectSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :description_multiloc,
      :description_preview_multiloc,
      :slug,
      :href,
      :map_config_id,
      :image_path, # Used by project library
      :visible_to,
      :ideas_count,
      :participants_count,
      :current_phase_end_at,
      :created_at,
      :updated_at

    has_one :admin_publication
    has_one :folder
    has_many :project_images

    def href
      Frontend::UrlService.new.model_to_url(object)
    end

    def participants_count
      ParticipantsService.new.project_participants_count(object)
    end

    def current_phase_end_at
      TimelineService.new.current_phase(object)&.end_at
    end

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

    class ProjectImageSerializer < ActiveModel::Serializer
      attributes :id, :versions

      def versions
        object.image.versions.to_h { |k, v| [k.to_s, v.url] }
      end
    end
  end
end
