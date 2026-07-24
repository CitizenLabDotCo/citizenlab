# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module Files
        class File < Base
          upload_attribute :content
          ref_attribute :uploader
          attributes %i[name size mime_type category ai_processing_allowed description_multiloc]
        end
      end
    end
  end
end
