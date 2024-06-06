# frozen_string_literal: true

require 'nanoid'

module ContentBuilder
  module Craftjs
    class State
      attr_reader :json

      def initialize(json)
        @json = json
      end

      # rubocop:disable Metrics/ParameterLists
      def add_node(
        type: nil,
        resolved_name: nil,
        display_name: nil,
        parent: 'ROOT',
        props: {},
        custom: {},
        hidden: false,
        is_canvas: false,
        nodes: [],
        linked_nodes: {},
        index: nil
      )
        if resolved_name && type
          raise ArgumentError, 'Cannot provide both `type` and `resolved_name`'
        end

        unless type || resolved_name
          raise ArgumentError, 'Must provide either `type` or `resolved_name`'
        end

        node = {
          'type' => type || { 'resolvedName' => resolved_name },
          'parent' => parent,
          'props' => props,
          'custom' => custom,
          'hidden' => hidden,
          'isCanvas' => is_canvas,
          'displayName' => display_name || resolved_name || type,
          'nodes' => nodes,
          'linkedNodes' => linked_nodes
        }

        id = generate_id
        json[id] = node

        parent_node = _node(parent)
        index ? parent_node['nodes'].insert(index, id) : parent_node['nodes'] << id

        id
      end
      # rubocop:enable Metrics/ParameterLists

      # @param [String] node_id
      # @param [Array<String>, String] new_node_ids
      # @return [Hash] The deleted/replaced node
      def replace_node(node_id, new_node_ids)
        new_node_ids = Array.wrap(new_node_ids)
        new_node_ids.each { |id| detach_node(id) }

        node_to_replace = _node(node_id)
        parent_id = node_to_replace['parent']
        parent_node = _node(parent_id)

        child_index = parent_node['nodes'].index(node_id)
        delete_node(node_id)
        parent_node['nodes'].insert(child_index, *new_node_ids)

        # Reattach the new nodes to the parent.
        new_node_ids.each do |id|
          new_node = _node(id)
          new_node['parent'] = parent_id
        end

        node_to_replace
      end

      def nodes_by_resolved_name(resolved_name)
        json.select do |_id, node|
          type = node['type']
          type.is_a?(Hash) && type['resolvedName'] == resolved_name
        end
      end

      def delete_node(node_id)
        deleted_nodes = {}
        ids_to_delete = [node_id]

        node = _node(node_id)
        parent = _node(node['parent'])
        parent['nodes'].delete(node_id)

        until ids_to_delete.empty?
          id = ids_to_delete.shift
          deleted_node = json.delete(id) { raise KeyError, "Node with id #{id} not found" }
          deleted_nodes[id] = deleted_node

          ids_to_delete.concat(deleted_node['linkedNodes'].values)
          ids_to_delete.concat(deleted_node['nodes'])
        end

        deleted_nodes
      end

      def node(id)
        json.fetch(id)
      end

      alias _node node # handy for avoiding name collisions when there is a local
      private :_node # variable named `node`

      private

      def detach_node(id)
        node = _node(id)
        parent = _node(node['parent'])
        node['parent'] = nil
        parent['nodes'].delete(id)
      end

      def generate_id
        # Using a Ruby port of nanoid, the library that Craft.js uses internally to
        # generate node IDs.
        Nanoid.generate(size: 10)
      end
    end
  end
end
