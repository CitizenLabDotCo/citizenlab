# frozen_string_literal: true

require 'rails_helper'

# Lint rules over the registered tools: conventions every tool must follow,
# enforced here because clients consume the registry sight unseen.
describe 'MCP tools registry' do
  it 'every tool spells out all four annotation hint fields' do
    aggregate_failures do
      McpServer::McpController::TOOL_CLASSES.each do |tool_class|
        annotations = tool_class.new.annotations

        expect(annotations).to match(
          read_only_hint: be_in([true, false]),
          destructive_hint: be_in([true, false]),
          idempotent_hint: be_in([true, false]),
          open_world_hint: be_in([true, false])
        ), "#{tool_class.name} annotations: #{annotations.inspect}"
      end
    end
  end

  # Not checked by the MCP gem: a typo here yields a tool that lists fine but
  # rejects every call with "Missing required arguments".
  it 'every tool declares only defined properties as required' do
    aggregate_failures do
      McpServer::McpController::TOOL_CLASSES.each do |tool_class|
        schema = tool_class.new.input_schema
        unknown_required = Array(schema[:required]).map(&:to_sym) - schema.fetch(:properties).keys

        expect(unknown_required).to be_empty,
          "#{tool_class.name} requires fields missing from properties: #{unknown_required.inspect}"
      end
    end
  end

  # Tripwire test. strip_readonly deliberately supports only the subset of JSON Schema we
  # currently need: readOnly under `properties` and `items`. This detects when a schema
  # uses it anywhere else (oneOf, patternProperties, ...), where it would be silently
  # ignored; in that case, we'll have to extend the stripping logic (or rework the schema).
  it 'every tool declares readOnly only where the Runner strip can reach it' do
    aggregate_failures do
      McpServer::McpController::TOOL_CLASSES.each do |tool_class|
        schema = tool_class.new.input_schema
        unreachable = all_readonly_paths(schema) - reachable_readonly_paths(schema)

        expect(unreachable).to be_empty, <<~MSG.squish
          #{tool_class.name} declares readOnly at #{unreachable.inspect}, where it will not
          be stripped. Rework the schema or extend ReadonlyStrip#strip_readonly.
        MSG
      end
    end
  end

  # Blind tree scan: no JSON Schema knowledge, complete by construction.
  # (`== true` so a property *named* readOnly doesn't count as the annotation.)
  def all_readonly_paths(node, path = '#', found = [])
    case node
    when Hash
      found << path if node[:readOnly] == true
      node.each { |key, value| all_readonly_paths(value, "#{path}/#{key}", found) }
    when Array
      node.each_with_index do |value, index|
        all_readonly_paths(value, "#{path}/#{index}", found)
      end
    end

    found
  end

  # Mirrors the walk of BaseTool::Runner#strip_readonly: properties (however nested)
  # and array items only.
  def reachable_readonly_paths(schema, path = '#', found = [])
    schema.fetch(:properties, {}).each do |key, property|
      property_path = "#{path}/properties/#{key}"
      found << property_path if property[:readOnly] == true
      reachable_readonly_paths(property, property_path, found)
      reachable_readonly_paths(property.fetch(:items, {}), "#{property_path}/items", found)
    end

    found
  end
end
