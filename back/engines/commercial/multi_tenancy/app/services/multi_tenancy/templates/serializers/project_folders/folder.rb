# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ProjectFolders
        class Folder < Base
          attributes %i[description_multiloc description_preview_multiloc title_multiloc]
          upload_attribute :header_bg
        end
      end
    end
  end
end
