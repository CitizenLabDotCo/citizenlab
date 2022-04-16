# frozen_string_literal: true

module ContentBuilder
  module Patches
    module Project
      def self.included(base)
        base.class_eval do
          has_many :content_builder_layouts,
                   class_name: 'ContentBuilder::Layout',
                   foreign_key: 'content_buildable_id',
                   dependent: :destroy
        end
      end
    end
  end
end
