# frozen_string_literal: true

module ContentBuilder
  # Puts project/folder descriptions on the Content Builder, used by the SideFx
  # creation/copy hook, the after-template hook, and the one-time WYSIWYG migration.
  #
  # Widget choice per description:
  # - blank         -> default layout (empty canvas for projects, title + published
  #                    projects for folders);
  # - inline media  -> lossless RichTextMultiloc "bridge" widget (images, videos, buttons);
  # - plain/rich text -> native TextMultiloc widget.
  class DescriptionLayoutService
    LAYOUT_CODE_BY_TYPE = {
      'Project' => 'project_description',
      'ProjectFolders::Folder' => 'project_folder_description'
    }.freeze

    # A ROOT-only craftjs canvas — the empty editor state the Content Builder
    # frame initialises from.
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

    def provision_for(buildable)
      ensure_on_content_builder!(buildable)
    end

    # Ensures every project/folder description in the current tenant is on the
    # Content Builder. A failure on one buildable is reported and skipped rather
    # than aborting tenant creation.
    def provision_all_descriptions!
      Project.find_each { |project| safely_ensure_on_content_builder(project) }
      ProjectFolders::Folder.find_each { |folder| safely_ensure_on_content_builder(folder) }
    end

    def ensure_on_content_builder!(buildable)
      existing = ContentBuilder::Layout.find_by(
        content_buildable: buildable,
        code: layout_code(buildable)
      )

      if existing
        unless existing.enabled
          existing.update!(enabled: true, craftjs_json: content_aware_craftjs_json(buildable))
        end
      else
        create_layout!(buildable, content_aware_craftjs_json(buildable))
      end

      ensure_project_page!(buildable) if buildable.is_a?(Project)
    end

    def layout_code(buildable)
      LAYOUT_CODE_BY_TYPE.fetch(buildable.class.name) do
        raise ArgumentError, "Unsupported buildable: #{buildable.class.name}"
      end
    end

    def description_blank?(description_multiloc)
      return true if description_multiloc.blank?

      description_multiloc.values.all? { |html| description_html_blank?(html) }
    end

    # True when any locale's HTML holds media the native text widget cannot render
    # losslessly: inline images, videos or CTA buttons, which stay on the bridge.
    def description_has_media?(description_multiloc)
      return false if description_multiloc.blank?

      description_multiloc.values.any? { |html| html_has_media?(html) }
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

    # Generic craftjs node builders, also used by the one-time WYSIWYG migration.

    def text_node(description_multiloc)
      content_node('TextMultiloc', description_multiloc)
    end

    def bridge_node(description_multiloc)
      content_node('RichTextMultiloc', description_multiloc, custom: {
        'title' => {
          'id' => 'app.containers.admin.ContentBuilder.richTextMultiloc',
          'defaultMessage' => 'Rich text'
        }
      })
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

    private

    def ensure_project_page!(project)
      return if ContentBuilder::Layout.exists?(content_buildable: project, code: ProjectPageLayoutService::CODE)

      ContentBuilder::Layout.create!(
        content_buildable: project,
        code: ProjectPageLayoutService::CODE,
        enabled: true,
        craftjs_json: ProjectPageLayoutService.new.craftjs_json_for(project)
      )
    end

    def safely_ensure_on_content_builder(buildable)
      ensure_on_content_builder!(buildable)
    rescue StandardError => e
      ErrorReporter.report(e, extra: { buildable_type: buildable.class.name, buildable_id: buildable.id })
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
    # reuses its canonical layout with the bridge swapped in for the description, so
    # the published-projects listing is preserved.
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

    def html_has_media?(html)
      fragment = Nokogiri::HTML.fragment(html.to_s)
      fragment.at('img') || fragment.at('iframe') || fragment.at_css('.custom-button')
    end
  end
end
