# frozen_string_literal: true

module ContentBuilder
  # Provisions the Content Builder "description" layout for a project or folder.
  #
  # Used in two places so that every description lives on the Content Builder:
  # - at buildable creation (SideFx patches), so new descriptions are
  #   Content-Builder-only with no WYSIWYG editor;
  # - by the one-time WYSIWYG migration, to backfill blank descriptions.
  #
  # The default layout is an empty canvas for projects and the canonical folder
  # layout (folder title + published projects) for folders — the latter so a
  # description-only layout never drops a folder's project listing.
  class DescriptionLayoutService
    LAYOUT_CODE_BY_TYPE = {
      'Project' => 'project_description',
      'ProjectFolders::Folder' => 'project_folder_description'
    }.freeze

    # A ROOT-only craftjs canvas — the empty editor state the Content Builder
    # frame initialises from (mirrors the structure craftjs serialises).
    EMPTY_PROJECT_CRAFTJS_JSON = {
      'ROOT' => {
        'type' => 'div',
        'isCanvas' => true,
        'props' => { 'id' => 'e2e-content-builder-frame' },
        'displayName' => 'div',
        'custom' => {},
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    }.freeze

    # Idempotently provisions an enabled description layout, gated on the feature.
    # Safe to call on every creation: no-op when the feature is off or a layout
    # already exists.
    def provision_for(buildable)
      return unless AppConfiguration.instance.feature_activated?('project_description_builder')

      ensure_enabled_default_layout!(buildable)
    end

    # Creates an enabled description layout seeded with the default layout, unless
    # the buildable already has a layout. Creates via Layout (not the has_many) so
    # the polymorphic content_buildable_type is set.
    def ensure_enabled_default_layout!(buildable)
      return if buildable.content_builder_layouts.exists?

      ContentBuilder::Layout.create!(
        content_buildable: buildable,
        code: layout_code(buildable),
        enabled: true,
        craftjs_json: default_craftjs_json(buildable)
      )
    end

    def layout_code(buildable)
      LAYOUT_CODE_BY_TYPE.fetch(buildable.class.name) do
        raise ArgumentError, "Unsupported buildable: #{buildable.class.name}"
      end
    end

    def default_craftjs_json(buildable)
      if buildable.is_a?(ProjectFolders::Folder)
        ContentBuilder::Craftjs::DefaultLayoutService.new
          .default_layout(buildable)
          .deep_stringify_keys
      else
        EMPTY_PROJECT_CRAFTJS_JSON.deep_dup
      end
    end
  end
end
