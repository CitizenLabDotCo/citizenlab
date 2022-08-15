# frozen_string_literal: true

module ContentBuilder
  module Patches
    module Project
      extend ActiveSupport::Concern

      included do
        has_many :content_builder_layouts,
          class_name: 'ContentBuilder::Layout',
          foreign_key: 'content_buildable_id',
          dependent: :destroy

        pg_search_scope :search_by_content_layouts, associated_against: {
          content_builder_layouts: %i[craftjs_jsonmultiloc]
        }
      end

      class_methods do
        def search_ids_by_all_including_patches(term)
          # #or gives
          # rgumentError: Relation passed to #or must be structurally compatible. Incompatible values: [:joins]
          # from /usr/local/bundle/gems/activerecord-6.1.6.1/lib/active_record/relation/query_methods.rb:725:in `or!'
          # So, using arrays of ids
          result = defined?(super) ? super : []
          result + search_by_content_layouts(term).pluck(:ids)
        end
      end
    end
  end
end
