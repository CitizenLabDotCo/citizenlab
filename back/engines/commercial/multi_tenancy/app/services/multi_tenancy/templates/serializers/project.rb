# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class Project < Base
        upload_attribute :header_bg

        attributes %i[
          description_multiloc
          description_preview_multiloc
          include_all_areas
          internal_role
          title_multiloc
          visible_to
        ]

        # Parked - validate publications:
        attribute(:admin_publication_attributes, nested: true) do |project|
          publication = project.admin_publication
          {
            'publication_status' => publication.publication_status,
            'ordering' => publication.ordering,
            'parent_ref' => Ref.new(publication, :parent)
          }
        end
      end
    end
  end
end
