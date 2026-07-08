# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Moves a project/folder's legacy WYSIWYG `description_multiloc` onto the
      # Content Builder, picking the widget by content (see
      # ContentBuilder::DescriptionLayoutService). A project's description is
      # wrapped beside the participation AboutBox in a "2 column" widget so the
      # legacy WYSIWYG sidebar is preserved; folders have no sidebar.
      #
      # A disabled layout (admin toggled the builder on then off) is re-pointed at
      # the chosen layout and enabled; its prior craftjs_json is logged first so the
      # overwrite is recoverable. `description_multiloc` is never touched.
      #
      # Idempotent: a second run finds an enabled layout and skips. Operates on the
      # current tenant; the rake task switches tenants, aggregates the stats, and
      # shares one ScriptReporter so every created/overwritten layout is captured in
      # a single recoverable JSON report across all tenants.
      class DescriptionToContentBuilderMigrationService
        def initialize(reporter: ScriptReporter.new)
          @stats = Hash.new(0)
          @reporter = reporter
        end

        attr_reader :stats, :reporter

        def migrate(persist:)
          Project.find_each { |project| migrate_buildable(project, persist: persist) }
          ProjectFolders::Folder.find_each { |folder| migrate_buildable(folder, persist: persist) }
          @stats
        end

        def migrate_buildable(buildable, persist:)
          code = description_layout_service.layout_code(buildable)
          existing = buildable.content_builder_layouts.find_by(code: code)

          if existing&.enabled
            @stats[:skipped_existing] += 1
            return
          end

          blank = description_layout_service.description_blank?(buildable.description_multiloc)
          craftjs = migrated_craftjs_json(buildable)

          if existing
            migrate_straggler(buildable, existing, craftjs, persist: persist)
          else
            create_layout(buildable, craftjs, persist: persist)
          end

          @stats[:migrated] += 1
          @stats[:created_blank] += 1 if blank
          @stats[buildable.is_a?(Project) ? :projects_migrated : :folders_migrated] += 1
        rescue StandardError => e
          @stats[:errors] += 1
          @reporter.add_error(e.message, context: report_context(buildable))
          Rails.logger.error "   ❌ Error migrating #{buildable.class.name} #{buildable.id}: #{e.message}"
          ErrorReporter.report(e, extra: { buildable_type: buildable.class.name, buildable_id: buildable.id })
        end

        private

        def report_context(buildable)
          { tenant: Tenant.current.host, buildable_type: buildable.class.name, buildable_id: buildable.id }
        end

        # The "2 column" ratio reproducing the legacy ~2/3 + 1/3 split (wide left
        # description, narrow right sidebar).
        ABOUT_BOX_COLUMN_LAYOUT = '2-1'

        def description_layout_service
          @description_layout_service ||= ContentBuilder::DescriptionLayoutService.new
        end

        # Wraps a project's description beside the participation AboutBox; folders have
        # no sidebar and keep the plain content-aware layout. This sidebar preservation
        # lives in the migration, not the going-forward DescriptionLayoutService.
        def migrated_craftjs_json(buildable)
          return description_layout_service.content_aware_craftjs_json(buildable) unless buildable.is_a?(Project)

          about_box_project_craftjs(buildable.description_multiloc)
        end

        def about_box_project_craftjs(description_multiloc)
          description_node =
            if description_layout_service.description_blank?(description_multiloc)
              description_layout_service.text_node({})
            elsif description_layout_service.description_has_media?(description_multiloc)
              description_layout_service.bridge_node(description_multiloc)
            else
              description_layout_service.text_node(description_multiloc)
            end
          two_column_with_about_box(description_node)
        end

        # ROOT -> TwoColumn -> [left Container -> description, right Container -> AboutBox].
        def two_column_with_about_box(description_node)
          two_column_id = SecureRandom.alphanumeric(10)
          left_id = SecureRandom.alphanumeric(10)
          right_id = SecureRandom.alphanumeric(10)
          description_id = SecureRandom.alphanumeric(10)
          about_box_id = SecureRandom.alphanumeric(10)

          {
            'ROOT' => {
              'type' => 'div',
              'isCanvas' => true,
              'props' => { 'id' => 'e2e-content-builder-frame' },
              'displayName' => 'div',
              'custom' => {},
              'hidden' => false,
              'nodes' => [two_column_id],
              'linkedNodes' => {}
            },
            two_column_id => two_column_node('ROOT', [left_id, right_id]),
            left_id => column_container_node(two_column_id, 'left', [description_id]),
            description_id => description_node.merge('parent' => left_id),
            right_id => column_container_node(two_column_id, 'right', [about_box_id]),
            about_box_id => about_box_node(right_id)
          }
        end

        def two_column_node(parent_id, child_ids)
          {
            'type' => { 'resolvedName' => 'TwoColumn' },
            'isCanvas' => false,
            'props' => { 'columnLayout' => ABOUT_BOX_COLUMN_LAYOUT },
            'displayName' => 'TwoColumn',
            'custom' => {
              'title' => {
                'id' => 'app.containers.admin.ContentBuilder.twoColumnLayout',
                'defaultMessage' => '2 column'
              },
              'hasChildren' => true
            },
            'parent' => parent_id,
            'hidden' => false,
            'nodes' => child_ids,
            'linkedNodes' => {}
          }
        end

        def column_container_node(parent_id, column_id, child_ids)
          {
            'type' => { 'resolvedName' => 'Container' },
            'isCanvas' => true,
            'props' => { 'id' => column_id },
            'displayName' => 'Container',
            'custom' => {},
            'parent' => parent_id,
            'hidden' => false,
            'nodes' => child_ids,
            'linkedNodes' => {}
          }
        end

        def about_box_node(parent_id)
          {
            'type' => { 'resolvedName' => 'AboutBox' },
            'isCanvas' => false,
            'props' => { 'hideParticipationAvatars' => false },
            'displayName' => 'AboutBox',
            'custom' => {
              'title' => {
                'id' => 'app.containers.admin.ContentBuilder.participationBox',
                'defaultMessage' => 'Participation Box'
              },
              'noPointerEvents' => true
            },
            'parent' => parent_id,
            'hidden' => false,
            'nodes' => [],
            'linkedNodes' => {}
          }
        end

        def create_layout(buildable, craftjs, persist:)
          @stats[:created] += 1
          @reporter.add_create(
            'ContentBuilder::Layout',
            { code: description_layout_service.layout_code(buildable), enabled: true },
            context: report_context(buildable)
          )
          return unless persist

          description_layout_service.create_layout!(buildable, craftjs)
        end

        # Re-points a disabled layout at the chosen layout and enables it. The previous
        # craftjs_json is recorded in the reporter so any overwrite is recoverable.
        def migrate_straggler(buildable, layout, craftjs, persist:)
          had_content = layout_has_content?(layout)
          @stats[:remigrated_disabled] += 1
          @stats[:remigrated_disabled_with_content] += 1 if had_content

          @reporter.add_change(
            { enabled: layout.enabled, craftjs_json: layout.craftjs_json },
            { enabled: true, craftjs_json: craftjs },
            context: report_context(buildable).merge(layout_id: layout.id, had_content: had_content)
          )

          return unless persist

          layout.update!(enabled: true, craftjs_json: craftjs)
        end

        # A layout holds admin-built content when it has any node beyond the ROOT canvas.
        def layout_has_content?(layout)
          layout.craftjs_json.is_a?(Hash) && layout.craftjs_json.except('ROOT').present?
        end
      end
    end
  end
end
