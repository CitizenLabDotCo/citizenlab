# frozen_string_literal: true

module ContentBuilder
  # Puts project/folder descriptions on the Content Builder. Used in three places:
  # - the SideFx creation hook, so a brand-new buildable gets an (empty) layout;
  # - the after-template hook, so every project/folder in a freshly created tenant
  #   is on the builder regardless of which template it came from;
  # - the one-time WYSIWYG migration (delegates its craftjs building here).
  #
  # Widget choice per description:
  # - blank             -> default layout (empty canvas for projects, title +
  #                        published projects for folders);
  # - inline media      -> lossless RichTextMultiloc "bridge" widget (inline images
  #                        need server-side rendering; videos/buttons kept on the
  #                        bridge for guaranteed fidelity);
  # - plain/rich text   -> native TextMultiloc widget (no bridge debt).
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

    # --- Creation hook (brand-new buildables) ---------------------------------

    # Idempotently provisions an enabled, empty description layout, gated on the
    # feature. Safe to call on every creation: no-op when the feature is off or a
    # layout already exists.
    def provision_for(buildable)
      return unless feature_activated?

      ensure_enabled_default_layout!(buildable)
    end

    def ensure_enabled_default_layout!(buildable)
      return if buildable.content_builder_layouts.exists?

      create_layout!(buildable, default_craftjs_json(buildable))
    end

    # --- After-template hook (every buildable in a new tenant) -----------------

    # Ensures every project/folder description in the current tenant is on the
    # Content Builder. Resilient: a failure on one buildable is reported and
    # skipped rather than aborting tenant creation.
    def provision_all_descriptions!
      return unless feature_activated?

      Project.find_each { |project| safely_ensure_on_content_builder(project) }
      ProjectFolders::Folder.find_each { |folder| safely_ensure_on_content_builder(folder) }
    end

    # Idempotently puts one buildable's description on the Content Builder, picking
    # the widget by content (blank / media / text). Skips if a layout exists.
    def ensure_on_content_builder!(buildable)
      return if buildable.content_builder_layouts.exists?

      create_layout!(buildable, content_aware_craftjs_json(buildable))
    end

    # --- Shared building blocks (also used by the one-time migration) ----------

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

    # Wraps the description in the lossless RichTextMultiloc bridge widget. A folder
    # reuses its canonical layout (title + published projects) with the bridge
    # swapped in for the description, so the project listing is preserved.
    def bridge_craftjs_json(buildable)
      if buildable.is_a?(ProjectFolders::Folder)
        default_craftjs_json(buildable).tap do |craftjs|
          craftjs['TEXT'] = bridge_node(buildable.description_multiloc)
        end
      else
        single_node_project_craftjs(bridge_node(buildable.description_multiloc))
      end
    end

    # Wraps the description in a native TextMultiloc widget (text-only descriptions).
    def text_craftjs_json(buildable)
      if buildable.is_a?(ProjectFolders::Folder)
        # The default folder layout already holds the description in a TextMultiloc.
        default_craftjs_json(buildable)
      else
        single_node_project_craftjs(text_node(buildable.description_multiloc))
      end
    end

    def description_blank?(description_multiloc)
      return true if description_multiloc.blank?

      description_multiloc.values.all? { |html| description_html_blank?(html) }
    end

    private

    def feature_activated?
      AppConfiguration.instance.feature_activated?('project_description_builder')
    end

    def safely_ensure_on_content_builder(buildable)
      ensure_on_content_builder!(buildable)
    rescue StandardError => e
      ErrorReporter.report(e, extra: { buildable_type: buildable.class.name, buildable_id: buildable.id })
    end

    def content_aware_craftjs_json(buildable)
      multiloc = buildable.description_multiloc
      if description_blank?(multiloc)
        default_craftjs_json(buildable)
      elsif description_has_media?(multiloc)
        bridge_craftjs_json(buildable)
      else
        text_craftjs_json(buildable)
      end
    end

    # NB: create via Layout (not buildable.content_builder_layouts) so the
    # polymorphic content_buildable_type is set — the has_many lacks `as:`, and a
    # NULL type is invisible to the controller's find_by!.
    def create_layout!(buildable, craftjs_json)
      ContentBuilder::Layout.create!(
        content_buildable: buildable,
        code: layout_code(buildable),
        enabled: true,
        craftjs_json: craftjs_json
      )
    end

    # A ROOT canvas wrapping a single description node (project layouts).
    def single_node_project_craftjs(node)
      node_id = SecureRandom.alphanumeric(10)
      {
        'ROOT' => {
          'type' => 'div',
          'isCanvas' => true,
          'props' => { 'id' => 'e2e-content-builder-frame' },
          'displayName' => 'div',
          'custom' => {},
          'hidden' => false,
          'nodes' => [node_id],
          'linkedNodes' => {}
        },
        node_id => node
      }
    end

    def bridge_node(description_multiloc)
      content_node('RichTextMultiloc', description_multiloc, custom: {
        'title' => {
          'id' => 'app.containers.admin.ContentBuilder.richTextMultiloc',
          'defaultMessage' => 'Rich text'
        }
      })
    end

    def text_node(description_multiloc)
      content_node('TextMultiloc', description_multiloc)
    end

    def content_node(resolved_name, description_multiloc, custom: {})
      {
        'type' => { 'resolvedName' => resolved_name },
        'isCanvas' => false,
        'props' => { 'text' => description_multiloc },
        'displayName' => resolved_name,
        'custom' => custom,
        'parent' => 'ROOT',
        'hidden' => false,
        'nodes' => [],
        'linkedNodes' => {}
      }
    end

    # Mirrors SanitizationService#with_content?: HTML counts as content when it has
    # visible text or an inline image/iframe.
    def description_html_blank?(html)
      fragment = Nokogiri::HTML.fragment(html.to_s)
      fragment.text.strip.empty? && %w[img iframe].none? { |tag| fragment.at(tag) }
    end

    # True when any locale's HTML holds media the native text widget cannot render
    # losslessly — inline images (need server-side TextImage rendering) — or richer
    # embeds we keep on the bridge for guaranteed fidelity (videos, CTA buttons).
    def description_has_media?(description_multiloc)
      return false if description_multiloc.blank?

      description_multiloc.values.any? { |html| html_has_media?(html) }
    end

    def html_has_media?(html)
      fragment = Nokogiri::HTML.fragment(html.to_s)
      fragment.at('img') || fragment.at('iframe') || fragment.at_css('.custom-button')
    end
  end
end
