# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      class StaticPageFile < Base
        upload_attribute :file
        ref_attribute :static_page
        attributes %i[name ordering]
      end
    end
  end
end
