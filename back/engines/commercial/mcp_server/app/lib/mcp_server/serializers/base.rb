# frozen_string_literal: true

# Single base class for all MCP serializers.
#
# Two modes:
#
# 1. Wrapping mode (preferred): subclass declares `wraps <UpstreamSerializer>`. The base
#    class runs the upstream JSON:API serializer, flattens its output to a plain Ruby
#    Hash, and surfaces every emitted relationship automatically as `<name>_id` (for
#    belongs_to / has_one) or `<name_singular>_ids` (for has_many). Relationships listed
#    in `inline` are fully embedded instead of being surfaced as IDs.
#
# 2. Custom mode (escape hatch): subclass overrides `#attributes(record)` to return a
#    Hash directly. No `wraps` declaration. Use only when the upstream serializer's
#    shape doesn't fit the MCP surface (e.g. `Serializers::Permission`).
#
# Public API:
#
#   Serializers::Foo.serialize(record, params: {})        # => Hash
#   Serializers::Foo.serialize_all(collection, params: {}) # => Array<Hash>
#
# Per-call `params:` is passed straight through to the upstream serializer's `params:`
# (the place where the upstream resolves things like `current_user` or conditional-attr
# flags). Subclasses that need to drop or transform attributes override `attributes` and
# call `super.except(...)`.
#
# Defaults:
#   - Attributes: every key the upstream emits is included.
#   - Relationships: every relationship the upstream emits surfaces as IDs (auto-detected
#     single vs array). Use `inline` to embed instead.
#   - Empty has_many emits `name_ids: []`; unset belongs_to emits `name_id: null`.
class McpServer::Serializers::Base
  class << self
    attr_reader :upstream_serializer

    def wraps(upstream_serializer)
      @upstream_serializer = upstream_serializer
    end

    def serialize(record, params: {})
      new(params).attributes(record)
    end

    def serialize_all(collection, params: {})
      Array.wrap(collection).map { |r| serialize(r, params:) }
    end

    def inline(*names)
      inlined_relationships.concat(names).uniq!
    end

    def inlined_relationships
      @inlined_relationships ||= []
    end
  end

  attr_reader :params, :inlined_relationships
  delegate :upstream_serializer, to: :class

  # Default to the class-level inline list. Recursive calls pass `inlined_relationships: []`
  # to disable child-level inline declarations.
  def initialize(params, inlined_relationships: self.class.inlined_relationships)
    @params = params
    @inlined_relationships = inlined_relationships
  end

  def attributes(record)
    jsonapi = upstream_serializer
      .new(record, params: params, include: inlined_relationships)
      .serializable_hash

    flatten_jsonapi(jsonapi)
  end

  def flatten_jsonapi(jsonapi)
    data = jsonapi[:data]
    included_by_id = jsonapi[:included].to_a.index_by { |r| r[:id] }
    flatten_jsonapi_data(data, included_by_id)
  end

  protected

  def flatten_jsonapi_data(data, included)
    return data.map { |d| flatten_jsonapi_data(d, included) } if data.is_a?(Array)

    {
      id: data[:id],
      **data[:attributes],
      **flatten_relationships(data[:relationships] || {}, included)
    }
  end

  private

  def flatten_relationships(relationships, included)
    relationships.to_h do |name, relationship|
      ref_data = relationship.fetch(:data)
      single = ref_data.is_a?(Hash) || ref_data.nil?
      ids = single ? ref_data&.dig(:id) : ref_data.pluck(:id)

      if name.in?(inlined_relationships)
        [name, inlined_relationship(ids, included)]
      else
        key = single ? :"#{name}_id" : :"#{name.to_s.singularize}_ids"
        [key, ids]
      end
    end
  end

  def inlined_relationship(id_or_ids, included)
    return id_or_ids.map { |i| inlined_relationship(i, included) } if id_or_ids.is_a?(Array)

    resource = included.fetch(id_or_ids)
    resource_classname = resource[:type].to_s.classify
    serializer_class = McpServer::Serializers.const_get(resource_classname, false)
    serializer_class.new(params, inlined_relationships: []).flatten_jsonapi_data(resource, included)
  end
end
