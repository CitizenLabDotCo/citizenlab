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
          logo_node = create_logo_node!(state)
          title_node = create_multiloc_node(about_node, 'about-title', state)
          text_node = create_multiloc_node(about_node, 'about-text', state)

          new_node_ids = [logo_node].compact + [title_node, text_node]
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

    # @param [Hash] about_report_node
    # @param [String] linked_node_label
    # @param [ContentBuilder::Craftjs::State] state
    def create_multiloc_node(about_report_node, linked_node_label, state)
      container_node_id = about_report_node.dig('linkedNodes', linked_node_label)
      container_node = state.node(container_node_id)

      title_node_id = container_node['nodes'].first
      title_node = state.node(title_node_id)

      multiloc = title_node['props']['text']
      raise 'Cannot find title node text' if multiloc.blank?

      state.add_node(
        resolved_name: 'TextMultiloc',
        props: { text: multiloc }
      )
    end

    # endregion HELPER METHODS

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      tenant.switch do
        layouts = ContentBuilder::Layout
          .where.not('code LIKE ?', 'backup/%')
          .with_widget_type('AboutReportWidget')

        layouts.each do |layout|
          migrate_about_this_report_widgets!(layout)
        end
      end
    end
  end
end
