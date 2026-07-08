# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Validates a craftjs_json node graph. Returns a list of error strings (empty = valid),
    # each referencing the offending node id, so an API client can correct and retry.
    #
    # Two layers of checks:
    # - structural: the graph is a consistent craft.js document (ROOT present, parent/child
    #   references bidirectional, no orphans, double references or cycles, everything
    #   reachable). Always applied to the whole graph.
    # - conventions (only when `widget_specs` is given): platform rules — allowed widget
    #   types, linkedNodes slot names, prop enums and multiloc shapes. The specs table maps
    #   resolvedName => { 'slots' => [...], 'enums' => { prop => [...] }, 'multilocs' => [...] }.
    #   Pass `convention_scope` (an array of node ids) to check only those nodes — callers
    #   applying a partial update use this so pre-existing nodes they did not touch (legacy
    #   widgets, shapes from before these rules existed) cannot fail the whole update.
    class Validator
      NODE_KEYS = {
        'nodes' => Array,
        'linkedNodes' => Hash,
        'props' => Hash
      }.freeze

      def initialize(craftjs_json, widget_specs: nil, convention_scope: nil)
        @json = craftjs_json
        @widget_specs = widget_specs
        @convention_scope = convention_scope
      end

      # @return [Array<String>]
      def errors
        return ['craftjs_json must be a JSON object'] unless @json.is_a?(Hash)
        return ['ROOT node is missing'] unless @json.key?('ROOT')

        errors = @json.filter_map { |id, node| malformed_node_error(id, node) }
        # Reference checks assume well-formed nodes; report shape problems alone first.
        return errors if errors.any?

        errors.concat(reference_errors)
        errors.concat(convention_errors) if @widget_specs
        errors
      end

      private

      def malformed_node_error(id, node)
        return "node #{id}: must be a JSON object" unless node.is_a?(Hash)

        NODE_KEYS.each do |key, type|
          return "node #{id}: '#{key}' must be a #{type.name.downcase}" unless node[key].is_a?(type)
        end

        return "node #{id}: 'parent' is required" if id != 'ROOT' && !node['parent'].is_a?(String)

        nil
      end

      def reference_errors
        errors = []
        reference_counts = Hash.new(0)

        # ROOT is the document root: nothing may point at it and it has no parent.
        # Together with the exactly-one-reference rule below this also rules out cycles.
        errors << "node ROOT: must not have a 'parent'" if @json['ROOT']['parent'].present?

        @json.each do |id, node|
          Nodes.child_references(node).each do |via, child_id|
            reference_counts[child_id] += 1
            child = @json[child_id]
            if child_id == 'ROOT'
              errors << "node #{id}: must not reference ROOT as a #{via} child"
            elsif child.nil?
              errors << "node #{id}: #{via} references missing node '#{child_id}'"
            elsif child['parent'] != id
              errors << "node #{child_id}: 'parent' is '#{child['parent']}' but the node is a #{via} child of '#{id}'"
            end
          end
          # NOTE: no isCanvas requirement for parents with `nodes` children — legacy graphs
          # (e.g. old TwoColumn nodes holding their column Containers directly in `nodes`)
          # violate it and still render fine.
        end

        @json.each_key do |id|
          next if id == 'ROOT'

          count = reference_counts[id]
          errors << "node #{id}: not referenced by any parent's 'nodes' or 'linkedNodes'" if count.zero?
          errors << "node #{id}: referenced by #{count} parents; every node must have exactly one" if count > 1
        end

        errors.concat(unreachable_node_errors)
        errors
      end

      def unreachable_node_errors
        reachable = Set.new
        queue = ['ROOT']
        until queue.empty?
          id = queue.shift
          next if reachable.include?(id) || !@json.key?(id)

          reachable << id
          queue.concat(Nodes.child_references(@json[id]).map(&:last))
        end

        (@json.keys - reachable.to_a).map { |node_id| "node #{node_id}: not reachable from ROOT" }
      end

      def convention_errors
        errors = []

        if in_scope?('ROOT')
          root = @json['ROOT']
          errors << "node ROOT: 'type' must be the string 'div'" if root['type'] != 'div'
          errors << 'node ROOT: must be a canvas (isCanvas: true)' unless root['isCanvas']
        end

        @json.each do |id, node|
          next if id == 'ROOT' || !in_scope?(id)

          name = Nodes.resolved_name(node)
          spec = @widget_specs[name]
          if spec.nil?
            errors << "node #{id}: widget '#{name}' is not supported. Supported: #{@widget_specs.keys.join(', ')}"
            next
          end

          errors.concat(slot_errors(id, node, spec))
          errors.concat(prop_errors(id, node, spec))
        end

        errors
      end

      def in_scope?(id)
        @convention_scope.nil? || @convention_scope.include?(id)
      end

      def slot_errors(id, node, spec)
        allowed = spec['slots'] || []
        node['linkedNodes'].filter_map do |slot, child_id|
          if allowed.exclude?(slot)
            suffix = allowed.any? ? " (allowed: #{allowed.join(', ')})" : ''
            "node #{id}: unknown linkedNodes slot '#{slot}'#{suffix}"
          elsif @json[child_id] && !@json[child_id]['isCanvas']
            "node #{child_id}: slot containers must be a canvas (isCanvas: true)"
          end
        end
      end

      def prop_errors(id, node, spec)
        errors = []

        (spec['enums'] || {}).each do |prop, values|
          value = node['props'][prop]
          next if value.nil? || values.include?(value)

          errors << "node #{id}: props.#{prop} is '#{value}' but must be one of: #{values.join(', ')}"
        end

        (spec['multilocs'] || []).each do |prop|
          value = node['props'][prop]
          next if value.nil?

          errors.concat(multiloc_errors(id, prop, value))
        end

        errors
      end

      def multiloc_errors(id, prop, value)
        unless value.is_a?(Hash) && value.values.all?(String)
          return ["node #{id}: props.#{prop} must be a multiloc object mapping locales to strings"]
        end

        bad_locales = value.keys - CL2_SUPPORTED_LOCALES.map(&:to_s)
        return [] if bad_locales.none?

        ["node #{id}: props.#{prop} keys must be locales (like 'en' or 'fr-BE'); " \
         "unknown: #{bad_locales.join(', ')}"]
      end
    end
  end
end
