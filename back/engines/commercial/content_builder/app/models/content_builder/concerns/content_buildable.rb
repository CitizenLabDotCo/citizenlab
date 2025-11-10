# frozen_string_literal: true

module ContentBuilder
  module Concerns
    module ContentBuildable
      extend ActiveSupport::Concern

      # pg_search trick https://github.com/Casecommons/pg_search/issues/252#issuecomment-486606367
      # JSONPath spec (JSONB_PATH_QUERY, '$.*...') https://www.postgresql.org/docs/12/functions-json.html#FUNCTIONS-SQLJSON-PATH
      # .**. is used insted .*.*. because it's potentially more flexible (what if a new level of nesting is added?)
      # NOTE: There are separate queries for projects and folders because we could not find a way of making pg_search_scope dynamic
      CRAFTJS_PROJECT_TEXT_QUERY = <<-SQL.squish
        (
          SELECT
            ARRAY_AGG(CONCAT_WS('. ', text, title, alt, url))
          FROM
            (
              SELECT
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.text.*') AS text,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.title.*') AS title,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.alt.*') AS alt,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.url.*') AS url
              FROM
                content_builder_layouts
              WHERE
                content_builder_layouts.content_buildable_id = "projects"."id" AND
                content_builder_layouts.content_buildable_type = 'Project' AND
                content_builder_layouts.enabled = true
            ) AS _required_but_not_used
        )
      SQL

      CRAFTJS_FOLDER_TEXT_QUERY = <<-SQL.squish
        (
          SELECT
            ARRAY_AGG(CONCAT_WS('. ', text, title, alt, url))
          FROM
            (
              SELECT
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.text.*') AS text,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.title.*') AS title,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.alt.*') AS alt,
                JSONB_PATH_QUERY("craftjs_json", '$.**.props.url.*') AS url
              FROM
                content_builder_layouts
              WHERE
                content_builder_layouts.content_buildable_id = "project_folders_folders"."id" AND
                content_builder_layouts.content_buildable_type = 'ProjectFolders::Folder' AND
                content_builder_layouts.enabled = true
            ) AS _required_but_not_used
        )
      SQL

      included do
        has_many :content_builder_layouts,
          class_name: 'ContentBuilder::Layout',
          foreign_key: 'content_buildable_id',
          dependent: :destroy

        pg_search_scope :search_by_project_layouts, associated_against: {
          content_builder_layouts: [Arel.sql(CRAFTJS_PROJECT_TEXT_QUERY)]
        }, using: { tsearch: { prefix: true } }

        pg_search_scope :search_by_folder_layouts, associated_against: {
          content_builder_layouts: [Arel.sql(CRAFTJS_FOLDER_TEXT_QUERY)]
        }, using: { tsearch: { prefix: true } }

        def uses_content_builder?
          content_builder_layouts.any?(&:enabled)
        end
      end

      class_methods do
        def search_ids_by_all_including_patches(term)
          # #or gives
          # ArgumentError: Relation passed to #or must be structurally compatible. Incompatible values: [:joins]
          # from /usr/local/bundle/gems/activerecord-6.1.6.1/lib/active_record/relation/query_methods.rb:725:in `or!'
          # So, using arrays of ids.
          result = defined?(super) ? super : []
          result + search_by_layouts(term).pluck(:id)
        end

        def search_by_layouts(term)
          return search_by_project_layouts(term) if name == 'Project'
          return search_by_folder_layouts(term) if name == 'ProjectFolders::Folder'

          []
        end
      end
    end
  end
end
