# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Wraps a project/folder's legacy WYSIWYG `description_multiloc` into a single
      # Content Builder "bridge" widget (RichTextMultiloc), enabling the layout so
      # the citizen page renders the description through the Content Builder. The
      # legacy `description_multiloc` is left untouched.
      #
      # Skips blank descriptions and buildables already on the Content Builder, so
      # it is idempotent and resumable. Operates on the current tenant; the rake
      # task switches tenants and aggregates the per-tenant stats.
      class DescriptionToContentBuilderMigrationService
        LAYOUT_CODE_BY_TYPE = {
          'Project' => 'project_description',
          'ProjectFolders::Folder' => 'project_folder_description'
        }.freeze

        def initialize
          @stats = Hash.new(0)
        end

        attr_reader :stats

        # Migrates every project and folder in the current tenant.
        def migrate(persist:)
          Project.find_each { |project| migrate_buildable(project, persist: persist) }
          ProjectFolders::Folder.find_each { |folder| migrate_buildable(folder, persist: persist) }
          @stats
        end

        # Migrates a single buildable. Safe to call repeatedly.
        def migrate_buildable(buildable, persist:)
          code = LAYOUT_CODE_BY_TYPE[buildable.class.name]
          raise ArgumentError, "Unsupported buildable: #{buildable.class.name}" unless code

          if description_blank?(buildable.description_multiloc)
            @stats[:skipped_blank] += 1
            return
          end

          if buildable.content_builder_layouts.exists?(code: code)
            @stats[:skipped_existing] += 1
            return
          end

          if persist
            # NB: create via Layout (not buildable.content_builder_layouts) so the
            # polymorphic content_buildable_type is set — the has_many lacks
            # `as:`, and a NULL type is invisible to the controller's find_by!.
            ContentBuilder::Layout.create!(
              content_buildable: buildable,
              code: code,
              enabled: true,
              craftjs_json: build_craftjs_json(buildable)
            )
          end

          @stats[:migrated] += 1
          @stats[buildable.is_a?(Project) ? :projects_migrated : :folders_migrated] += 1
        rescue StandardError => e
          @stats[:errors] += 1
          Rails.logger.info "   ❌ Error migrating #{buildable.class.name} #{buildable.id}: #{e.message}"
        end

        private

        def description_blank?(description_multiloc)
          return true if description_multiloc.blank?

          description_multiloc.values.all? { |html| description_html_blank?(html) }
        end

        # Mirrors SanitizationService#with_content?: HTML counts as content when it
        # has visible text or an inline image/iframe.
        def description_html_blank?(html)
          fragment = Nokogiri::HTML.fragment(html.to_s)
          fragment.text.strip.empty? && %w[img iframe].none? { |tag| fragment.at(tag) }
        end

        def build_craftjs_json(buildable)
          if buildable.is_a?(ProjectFolders::Folder)
            build_folder_craftjs_json(buildable)
          else
            build_project_craftjs_json(buildable.description_multiloc)
          end
        end

        # Wraps the description multiloc in a single RichTextMultiloc bridge node
        # inside a ROOT canvas, matching the structure craftjs serialises (see the
        # homepage migration precedent and the RichTextMultiloc frontend widget).
        def build_project_craftjs_json(description_multiloc)
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
            node_id => bridge_node(description_multiloc)
          }
        end

        # A folder on the Content Builder renders ONLY its craftjs layout (its
        # project listing is not rendered separately), so a description-only
        # layout would drop the folder's published-projects list. We therefore
        # reuse the canonical folder layout (folder title + published projects)
        # and swap just its description node for the lossless bridge widget.
        def build_folder_craftjs_json(folder)
          craftjs = ContentBuilder::Craftjs::DefaultLayoutService.new
            .default_layout(folder)
            .deep_stringify_keys
          craftjs['TEXT'] = bridge_node(folder.description_multiloc)
          craftjs
        end

        def bridge_node(description_multiloc)
          {
            'type' => { 'resolvedName' => 'RichTextMultiloc' },
            'isCanvas' => false,
            'props' => { 'text' => description_multiloc },
            'displayName' => 'RichTextMultiloc',
            'custom' => {
              'title' => {
                'id' => 'app.containers.admin.ContentBuilder.richTextMultiloc',
                'defaultMessage' => 'Rich text'
              }
            },
            'parent' => 'ROOT',
            'hidden' => false,
            'nodes' => [],
            'linkedNodes' => {}
          }
        end
      end
    end
  end
end
