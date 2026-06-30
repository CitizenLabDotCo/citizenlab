# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Moves a project/folder's legacy WYSIWYG `description_multiloc` onto the
      # Content Builder, enabling the layout so the citizen page renders it. The
      # legacy `description_multiloc` is left untouched.
      #
      # After running, EVERY buildable is on the Content Builder (the widget is
      # chosen by content — see ContentBuilder::DescriptionLayoutService). A
      # project's description is wrapped beside the participation AboutBox (in a
      # "2 column" widget) so the legacy WYSIWYG sidebar is preserved; folders have
      # no sidebar and keep the plain content-aware widget:
      # - text-only description  -> native TextMultiloc widget;
      # - description with media -> lossless RichTextMultiloc "bridge" widget;
      # - blank description       -> for a project, the 2-column AboutBox layout with
      #                             an empty text widget on the left; for a folder, the
      #                             enabled default layout (title + published projects),
      #                             so there is no off-builder description;
      # - disabled layout        -> a "straggler" (admin toggled the builder on then
      #                             off). We re-point it at the chosen layout and
      #                             enable it. The prior craftjs_json is logged first
      #                             so the overwrite is recoverable;
      # - enabled layout         -> already on the builder, left untouched.
      #
      # Idempotent and resumable (a second run finds an enabled layout and skips).
      # Operates on the current tenant; the rake task switches tenants and
      # aggregates the per-tenant stats.
      class DescriptionToContentBuilderMigrationService
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
          code = description_layout_service.layout_code(buildable)
          existing = buildable.content_builder_layouts.find_by(code: code)

          # Already on the Content Builder — nothing to do.
          if existing&.enabled
            @stats[:skipped_existing] += 1
            return
          end

          # `blank` is still tracked for the summary stat.
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
          Rails.logger.error "   ❌ Error migrating #{buildable.class.name} #{buildable.id}: #{e.message}"
          ErrorReporter.report(e, extra: { buildable_type: buildable.class.name, buildable_id: buildable.id })
        end

        private

        # The "2 column" ratio reproducing the legacy ~2/3 + 1/3 split (wide left
        # description, narrow right sidebar). Mirrors the InfoWithAccordions widget.
        ABOUT_BOX_COLUMN_LAYOUT = '2-1'

        def description_layout_service
          @description_layout_service ||= ContentBuilder::DescriptionLayoutService.new
        end

        # The craftjs the migration writes. A project's description is wrapped beside
        # the participation AboutBox so the legacy WYSIWYG sidebar is preserved; a
        # folder keeps the plain content-aware layout (it has no sidebar). This
        # WYSIWYG-preservation lives here, in the single-use migration, rather than in
        # the going-forward DescriptionLayoutService — once every buildable is on the
        # Content Builder the distinction no longer exists.
        def migrated_craftjs_json(buildable)
          return description_layout_service.content_aware_craftjs_json(buildable) unless buildable.is_a?(Project)

          about_box_project_craftjs(buildable.description_multiloc)
        end

        # A project layout: the description in the wide left column of a "2 column"
        # widget, the participation AboutBox in the narrow right column. A blank
        # description still gets the sidebar, with an empty TextMultiloc on the left.
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
        # Mirrors the craftjs the editor serialises for the InfoWithAccordions template.
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
          return unless persist

          description_layout_service.create_layout!(buildable, craftjs)
        end

        # Re-points a disabled (abandoned) layout at the chosen layout and enables
        # it. The previous craftjs_json is logged first (only when it holds real
        # content) so any overwrite is recoverable; `description_multiloc`, the
        # live content, is never touched.
        def migrate_straggler(buildable, layout, craftjs, persist:)
          had_content = layout_has_content?(layout)
          @stats[:remigrated_disabled] += 1
          @stats[:remigrated_disabled_with_content] += 1 if had_content

          return unless persist

          if had_content
            Rails.logger.info(
              "   💾 Overwriting disabled layout #{layout.id} for #{buildable.class.name} " \
              "#{buildable.id}; previous craftjs_json: #{layout.craftjs_json.to_json}"
            )
          end

          layout.update!(enabled: true, craftjs_json: craftjs)
        end

        # A layout holds admin-built content when it has any node beyond the ROOT
        # canvas (an empty/never-built layout is `{}` or ROOT-only).
        def layout_has_content?(layout)
          layout.craftjs_json.is_a?(Hash) && layout.craftjs_json.except('ROOT').present?
        end
      end
    end
  end
end
