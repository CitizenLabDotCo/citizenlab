# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Validates a craftjs_json node graph. Returns a list of Error values (empty =
    # valid), each carrying the offending node id and a machine-readable code, and
    # stringifying to a client-facing message so an API client can correct and retry.
    #
    # Two layers of checks:
    # - structural: the graph is a consistent craft.js document (ROOT present, parent/child
    #   references bidirectional, no orphans, double references or cycles, everything
    #   reachable). Always applied to the whole graph.
    # - conventions (only when `widget_specs` is given): platform rules — allowed widget
    #   types, node id format, undeclared node keys, linkedNodes slot names, prop enums
    #   and multiloc shapes. The specs table maps
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

      # The exact key set craftjs nodes carry (the cheatsheet already documents it as
      # exhaustive); anything else would be silently persisted into the stored jsonb.
      ALLOWED_NODE_KEYS = %w[type parent props custom hidden isCanvas displayName nodes linkedNodes].freeze

      # craft.js generates 10-char nanoid ids from this alphabet. Only the alphabet and
      # a generous length cap are enforced, so hand-written ids remain possible.
      ID_FORMAT = /\A[A-Za-z0-9_-]{1,64}\z/

      # One validation problem. `node_id` is the offending node (nil for document-level
      # problems), `code` is a stable machine-readable symbol, `message` the client-facing
      # prose. to_s renders the full message as API clients see it.
      Error = Data.define(:node_id, :code, :message) do
        def to_s
          return message if node_id.nil?

          printable_id = ID_FORMAT.match?(node_id) ? node_id : node_id.inspect
          "node #{printable_id}: #{message}"
        end
      end

      def initialize(craftjs_json, widget_specs: nil, convention_scope: nil)
        @json = craftjs_json
        @widget_specs = widget_specs
        @convention_scope = convention_scope
      end

      # @return [Array<Error>]
      def errors
        return [error(nil, :not_an_object, 'craftjs_json must be a JSON object')] unless @json.is_a?(Hash)
        return [error(nil, :root_missing, 'ROOT node is missing')] unless @json.key?('ROOT')

        errors = @json.filter_map { |id, node| malformed_node_error(id, node) }
        # Reference checks assume well-formed nodes; report shape problems alone first.
        return errors if errors.any?

        errors.concat(reference_errors)
        errors.concat(convention_errors) if @widget_specs
        errors
      end

      private

      def error(node_id, code, message)
        Error.new(node_id: node_id, code: code, message: message)
      end

      def malformed_node_error(id, node)
        return error(id, :malformed_node, 'must be a JSON object') unless node.is_a?(Hash)

        NODE_KEYS.each do |key, type|
          unless node[key].is_a?(type)
            return error(id, :malformed_node, "'#{key}' must be a #{type.name.downcase}")
          end
        end

        return error(id, :missing_parent, "'parent' is required") if id != 'ROOT' && !node['parent'].is_a?(String)

        nil
      end

      def reference_errors
        errors = []
        reference_counts = Hash.new(0)

        # ROOT is the document root: nothing may point at it and it has no parent.
        # Together with the exactly-one-reference rule below this also rules out cycles.
        errors << error('ROOT', :root_with_parent, "must not have a 'parent'") if @json['ROOT']['parent'].present?

        @json.each do |id, node|
          Query.child_references(node).each do |via, child_id|
            reference_counts[child_id] += 1
            child = @json[child_id]
            if child_id == 'ROOT'
              errors << error(id, :root_referenced, "must not reference ROOT as a #{via} child")
            elsif child.nil?
              errors << error(id, :missing_child, "#{via} references missing node '#{child_id}'")
            elsif child['parent'] != id
              errors << error(child_id, :parent_mismatch,
                "'parent' is '#{child['parent']}' but the node is a #{via} child of '#{id}'")
            end
          end
          # NOTE: no isCanvas requirement for parents with `nodes` children — legacy graphs
          # (e.g. old TwoColumn nodes holding their column Containers directly in `nodes`)
          # violate it and still render fine.
        end

        @json.each_key do |id|
          next if id == 'ROOT'

          count = reference_counts[id]
          if count.zero?
            errors << error(id, :unreferenced, "not referenced by any parent's 'nodes' or 'linkedNodes'")
          elsif count > 1
            errors << error(id, :multiple_parents, "referenced by #{count} parents; every node must have exactly one")
          end
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
          queue.concat(Query.child_references(@json[id]).map(&:last))
        end

        (@json.keys - reachable.to_a).map { |node_id| error(node_id, :unreachable, 'not reachable from ROOT') }
      end

      def convention_errors
        errors = []

        if in_scope?('ROOT')
          root = @json['ROOT']
          errors << error('ROOT', :root_type, "'type' must be the string 'div'") if root['type'] != 'div'
          errors << error('ROOT', :root_not_canvas, 'must be a canvas (isCanvas: true)') unless root['isCanvas']
          errors.concat(unknown_key_errors('ROOT', root))
        end

        @json.each do |id, node|
          next if id == 'ROOT' || !in_scope?(id)

          unless ID_FORMAT.match?(id)
            errors << error(id, :invalid_id, "node ids must be 1-64 characters of A-Z, a-z, 0-9, '-' or '_'")
          end
          errors.concat(unknown_key_errors(id, node))
          errors.concat(type_key_errors(id, node))

          name = Query.resolved_name(node)
          spec = @widget_specs[name]
          if spec.nil?
            errors << error(id, :unsupported_widget,
              "widget '#{name}' is not supported. Supported: #{@widget_specs.keys.join(', ')}")
            next
          end

          errors.concat(slot_errors(id, node, spec))
          errors.concat(prop_errors(id, node, spec))
        end

        errors.concat(slot_canvas_errors)
        errors
      end

      def in_scope?(id)
        @convention_scope.nil? || @convention_scope.include?(id)
      end

      def unknown_key_errors(id, node)
        unknown = node.keys - ALLOWED_NODE_KEYS
        return [] if unknown.none?

        [error(id, :unknown_keys, "unknown keys: #{unknown.join(', ')} (allowed: #{ALLOWED_NODE_KEYS.join(', ')})")]
      end

      # An object 'type' carries exactly craft.js's single key; anything else would
      # be silently persisted into the stored jsonb.
      def type_key_errors(id, node)
        type = node['type']
        return [] unless type.is_a?(Hash)

        unknown = type.keys - ['resolvedName']
        return [] if unknown.none?

        [error(id, :unknown_keys, "unknown keys in 'type': #{unknown.join(', ')} (allowed: resolvedName)")]
      end

      def slot_errors(id, node, spec)
        allowed = spec['slots'] || []
        node['linkedNodes'].keys.filter_map do |slot|
          if allowed.exclude?(slot)
            suffix = allowed.any? ? " (allowed: #{allowed.join(', ')})" : ''
            error(id, :unknown_slot, "unknown linkedNodes slot '#{slot}'#{suffix}")
          end
        end
      end

      # Slot containers must be canvases. Checked over every linkedNodes edge in the
      # graph — not per in-scope parent — so a patch that flips a stored container to
      # isCanvas: false without re-sending its parent widget is still caught. The edge
      # counts as in scope when either side of it is.
      def slot_canvas_errors
        @json.flat_map do |id, node|
          node['linkedNodes'].filter_map do |_slot, child_id|
            child = @json[child_id]
            next unless child && !child['isCanvas']
            next unless in_scope?(id) || in_scope?(child_id)

            error(child_id, :slot_not_canvas, 'slot containers must be a canvas (isCanvas: true)')
          end
        end
      end

      def prop_errors(id, node, spec)
        errors = []

        (spec['enums'] || {}).each do |prop, values|
          value = node['props'][prop]
          next if value.nil? || values.include?(value)

          errors << error(id, :invalid_enum_value,
            "props.#{prop} is '#{value}' but must be one of: #{values.join(', ')}")
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
          return [error(id, :invalid_multiloc, "props.#{prop} must be a multiloc object mapping locales to strings")]
        end

        bad_locales = value.keys - CL2_SUPPORTED_LOCALES.map(&:to_s)
        return [] if bad_locales.none?

        [error(id, :unknown_locales,
          "props.#{prop} keys must be locales (like 'en' or 'fr-BE'); unknown: #{bad_locales.join(', ')}")]
      end
    end
  end
end
