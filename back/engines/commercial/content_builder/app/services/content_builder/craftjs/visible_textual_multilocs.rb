module ContentBuilder
  module Craftjs
    # Extracts multilocs for visible text from a craftjs in the order they appear in the visual layout.
    class VisibleTextualMultilocs
      def initialize(craftjs, with_metadata: false)
        @craftjs = LayoutSanitizationService.new.sanitize(craftjs)
        @with_metadata = with_metadata
        @ordered_multilocs = []
      end

      # Orders textual (text & title) multilocs found in the craftjs by how they appear in the layout,
      # so that columns are ordered from left to right, and texts from top to bottom within each column.
      # Top to bottom ordering within containers is also respected (the visual order
      # comes from Query.each_visual, shared with McpServer::Serializers::LayoutOutline).
      # Ignores ImageMultiloc nodes, which may include an image alt-text.
      def extract
        Query.each_visual(@craftjs) do |_id, node, _depth, _slot|
          take_multiloc(node, Query.resolved_name(node))
        end
        @ordered_multilocs
      end

      def extract_and_join
        @with_metadata = false
        locales = AppConfiguration.instance.settings['core']['locales']
        extracted = extract.compact

        locales.index_with do |locale|
          extracted.filter_map { |multiloc| multiloc[locale] }.join
        end
      end

      private

      # `with_metadata: true` may not be useful (TBD), as it only differentiates between accordian titles and texts.
      # TextMultiloc nodes always store their multiloc in node['props']['text'],
      # regardless of whether they are actually used as titles or texts.
      def take_multiloc(node, resolved_name)
        return unless Layout::TEXT_CRAFTJS_NODE_TYPES.include? resolved_name

        if @with_metadata
          if resolved_name == 'AccordionMultiloc'
            @ordered_multilocs << {
              node_type: 'AccordionMultiloc',
              multiloc_type: 'title',
              multliloc: make_h3s(node['props']['title']) # Add h3 tags to indicate style the FE would apply.
            }
          end

          @ordered_multilocs << {
            node_type: resolved_name,
            multiloc_type: 'text',
            multliloc: node['props']['text']
          }
        else
          @ordered_multilocs << make_h3s(node['props']['title']) if resolved_name == 'AccordionMultiloc'
          @ordered_multilocs << node['props']['text'] if node['props']['text'].present?
        end
      end

      def make_h3s(multliloc)
        multliloc.transform_values! { |text| "<h3>#{text}</h3>" }
      end
    end
  end
end
