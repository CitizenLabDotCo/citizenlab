module ContentBuilder
  module WebApi
    module V1
      class LayoutImageSerializer < ::WebApi::V1::BaseSerializer
        attributes :code, :created_at, :updated_at

        attribute :versions do |object|
          object.image.versions.map { |k, v| [k.to_s, v.url] }.to_h
        end
      end
    end
  end
end
