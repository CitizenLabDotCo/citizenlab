# frozen_string_literal: true

module PublicApi
  module V2
    module ProjectFolders
      class FolderSerializer < PublicApi::V2::BaseSerializer
        attributes(
          :id,
          :slug,
          :created_at,
          :updated_at,
          :description_multiloc,
          :description
        )

        attribute(:publication_status) do
          object.admin_publication.publication_status
        end

        multiloc_attributes(
          :title_multiloc,
          :description_preview_multiloc
        )

        # The folder authors its description on the Content Builder, so both fields are
        # rebuilt from its layout rather than read off the record.
        def description_multiloc
          @description_multiloc ||= description_service.description_multiloc(object)
        end

        def description
          multiloc_service.t(description_multiloc)
        end
      end
    end
  end
end
