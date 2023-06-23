# frozen_string_literal: true

module PublicApi
  module V2
    module ProjectFolders
      class FolderSerializer < PublicApi::V2::BaseSerializer
        attributes(
          :id,
          :slug,
          :created_at,
          :updated_at
        )

        attribute(:publication_status) do
          object.admin_publication.publication_status
        end

        multiloc_attributes(
          :title_multiloc,
          :description_multiloc,
          :description_preview_multiloc
        )
      end
    end
  end
end
