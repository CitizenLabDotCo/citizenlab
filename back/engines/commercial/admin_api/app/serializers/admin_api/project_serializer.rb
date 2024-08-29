# frozen_string_literal: true

module AdminApi
  class ProjectSerializer < ActiveModel::Serializer
    attributes :id,
      :title_multiloc,
      :description_multiloc,
      :slug,
      :map_config_id,
      :visible_to,
      :created_at,
      :updated_at

    has_one :admin_publication
    has_one :folder

    class AdminPublicationSerializer < ActiveModel::Serializer
      attributes :id, :publication_status
    end

    class FolderSerializer < ActiveModel::Serializer
      attributes :id, :title_multiloc, :description_multiloc, :slug
    end
  end
end
