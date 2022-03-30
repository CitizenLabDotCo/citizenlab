module ContentBuilder
  module WebApi
    module V1
      class LayoutSerializer < ::WebApi::V1::BaseSerializer
        set_type :content_builder_layout
        attributes :craftjs_jsonmultiloc, :enabled, :code, :created_at, :updated_at
      end
    end
  end
end
