# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ProjectFolders
        class Folder < Base
          attributes %i[description_multiloc description_preview_multiloc title_multiloc]
          upload_attribute :header_bg

          # attribute(:admin_publication_attributes, nested: true) do |folder|
          #   publication = folder.admin_publication
          #   # The day that folders can be nested, we will need to add parent_ref and ensure that folders are serialized from top to bottom.
          #   {
          #     'publication_status' => publication.publication_status,
          #     'ordering' => publication.ordering
          #   }
          # end
        end
      end
    end
  end
end
