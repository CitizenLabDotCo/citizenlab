# frozen_string_literal: true

module Tasks
  module SingleUse
    module Services
      # Moves a project/folder's legacy WYSIWYG `description_multiloc` onto the
      # Content Builder, enabling the layout so the citizen page renders it. The
      # legacy `description_multiloc` is left untouched.
      #
      # After running, EVERY buildable is on the Content Builder (the widget is
      # chosen by content, consistent with new-buildable/template provisioning —
      # see ContentBuilder::DescriptionLayoutService):
      # - text-only description  -> native TextMultiloc widget;
      # - description with media -> lossless RichTextMultiloc "bridge" widget;
      # - blank description       -> enabled default layout (empty canvas for
      #                             projects, title + published projects for
      #                             folders) so there is no off-builder description;
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

          # Content-aware layout: text -> TextMultiloc, media -> bridge, blank ->
          # default. `blank` is still tracked for the summary stat.
          blank = description_layout_service.description_blank?(buildable.description_multiloc)
          craftjs = description_layout_service.content_aware_craftjs_json(buildable)

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

        def description_layout_service
          @description_layout_service ||= ContentBuilder::DescriptionLayoutService.new
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
