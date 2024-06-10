# frozen_string_literal: true

namespace :single_use do
  task migrate_deprecated_about_this_report_widget: [:environment] do |_t, _args|
    # region HELPER METHODS

    # @param [ContentBuilder::Layout] layout
    def migrate_about_this_report_widgets!(layout)
      json = layout.craftjs_json

      ContentBuilder::Layout.transaction do
        layout.dup.tap do |backup|
          backup.code = "backup/#{layout.code}/#{layout.id}"
          backup.content_buildable = nil
        end.save!

        state = ContentBuilder::Craftjs::State.new(json)

        about_nodes = state.nodes_by_resolved_name('AboutReportWidget')

        about_nodes.each do |node_id, about_node|
          new_node_ids = [create_logo_node!(state)].compact

          title_node_id = about_node.dig('linkedNodes', 'about-title')
          new_node_ids += state.node(title_node_id)['nodes'] if title_node_id

          text_node_id = about_node.dig('linkedNodes', 'about-text')
          new_node_ids += state.node(text_node_id)['nodes'] if text_node_id

          state.replace_node(node_id, new_node_ids)
        end

        layout.update!(craftjs_json: state.json)
      end
    end

    # @param [ContentBuilder::Craftjs::State] state
    # @return [String, nil]
    def create_logo_node!(state)
      logo = AppConfiguration.instance.logo.versions[:medium]
      return if logo.blank?

      data_code = ContentBuilder::LayoutImage.create!(image: logo).code

      state.add_node(
        resolved_name: 'ImageMultiloc',
        display_name: 'Image',
        props: {
          image: { dataCode: data_code },
          stretch: false
        }
      )
    end

    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('AboutReportWidget')

        layouts.each do |layout|
          Rails.logger.info(
            'Migrating deprecated AboutThisReportWidget',
            tenant_id: tenant.id,
            layout_id: layout.id
          )

          migrate_about_this_report_widgets!(layout)
        end
      end
    end
  end
end
