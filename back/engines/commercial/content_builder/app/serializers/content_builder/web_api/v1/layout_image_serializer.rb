# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      class LayoutImageSerializer < ::WebApi::V1::BaseSerializer
        attributes :code, :created_at, :updated_at

        attribute :image_url do |layout_image|
          layout_image.image.url
        end
      end
    end
  end
end
