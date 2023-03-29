# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ProjectFolders
        class Folder < Base
          attributes %i[description_multiloc description_preview_multiloc title_multiloc]

          attribute(:admin_publication_attributes) do |folder, serialization_params|
            serializer = MultiTenancy::Templates::Serializers::AdminPublication.new(serialization_params)
            serializer.serialize(folder.admin_publication)
          end

          upload_attribute :header_bg
        end
      end
    end
  end
end
