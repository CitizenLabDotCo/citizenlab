# frozen_string_literal: true

# Base class for MCP serializers.
#
# In most cases, flattening the web API serializer's output is just what we need. To
# define such a serializer, declare which upstream serializer to wrap:
#
#   class Serializers::Project < Serializers::Base
#     wraps ::WebApi::V1::ProjectSerializer
#   end
#
# The base runs the upstream serializer, flattens its JSON:API output to a plain Hash,
# and surfaces every relationship as `<name>_id` / `<name_singular>_ids` by default
# (auto-detected one-to-one vs one-to-many). Relationships listed in `inline` are embedded
# as the flattened hash of the resource from the JSON:API `included` section instead:
#
#   class Serializers::CustomField < Serializers::Base
#     wraps ::WebApi::V1::CustomFieldSerializer
#     inline :options, :matrix_statements
#   end
#
# To tweak the flattened output (drop a key, rename, add a derived attribute), override
# +#attributes(record)+ — +super+ returns the flattened Hash:
#
#   class Serializers::Project < Serializers::Base
#     wraps ::WebApi::V1::ProjectSerializer
#
#     def attributes(record)
#       super.except(:internal_key).merge(participants_count: record.ideas_count)
#     end
#   end
#
# When the upstream serializer's shape doesn't fit at all, override +#attributes(record)+
# without declaring +wraps+ and build the hash from scratch.
#
# Usage:
#
#   Serializers::Project.serialize(project)            # => Hash
#   Serializers::Project.serialize(Project.all)        # => Array<Hash>
#   Serializers::Project.serialize(project, params: { current_user: user })
#
# +params:+ is forwarded to the upstream serializer's +params:+.
class McpServer::Serializers::Base
  class << self
    attr_reader :upstream_serializer

    def wraps(upstream_serializer)
      @upstream_serializer = upstream_serializer
    end

    def serialize(record_or_collection, params: {})
      new(record_or_collection, params).to_h
    end

    def inline(*names)
      inlined_relationships.concat(names).uniq!
    end

    def inlined_relationships
      @inlined_relationships ||= []
    end
  end

  delegate :upstream_serializer, to: :class

  attr_reader :params, :inlined_relationships, :records

  def collection? = @collection

  def initialize(
    record_or_collection,
    params,
    inlined_relationships: self.class.inlined_relationships
  )
    @records = Array.wrap(record_or_collection)
    @collection = record_or_collection.is_a?(ActiveRecord::Relation) || record_or_collection.is_a?(Array)
    @params = params
    @inlined_relationships = inlined_relationships
  end

  def to_h
    return [] if collection? && records.empty?

    if upstream_serializer
      jsonapi = upstream_serializer
        .new(records, params:, include: inlined_relationships)
        .serializable_hash

      @flattened_jsonapi_by_id = McpServer::Jsonapi
        .flatten(jsonapi, inline_rels: inlined_relationships)
        .index_by { it[:id] }
    end

    collection? ? records.map { attributes(it) } : attributes(records.sole)
  end

  def attributes(record)
    unless upstream_serializer
      raise NotImplementedError, <<~MSG.squish
        #{self.class.name} must declare `wraps` or override `#attributes`
      MSG
    end

    @flattened_jsonapi_by_id.fetch(record.id)
  end

  private

  # Helper that returns the admin and citizen-facing URLs for the record.
  # Serializers that want to surface click-through URLs to the LLM should opt in
  # by merging `urls(record).compact` into their `#attributes` output.
  def urls(record)
    url_service = Frontend::UrlService.new

    {
      admin_url: url_service.admin_url_for(record),
      public_url: url_service.model_to_url(record)
    }
  end
end
