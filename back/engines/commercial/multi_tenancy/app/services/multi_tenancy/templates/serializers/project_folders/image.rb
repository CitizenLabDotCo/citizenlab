# frozen_string_literal: true

module MultiTenancy
  module Templates
    module Serializers
      module ProjectFolders
        class Image < Base
          ref_attribute :project_folder
          upload_attribute :image
          attributes %i[ordering alt_text_multiloc]
        end
      end
    end
  end
end
