# frozen_string_literal: true

module DecidimImporter
  # An intermediate, storage-agnostic representation of a single record destined for the tenant
  # template. `attributes` is the *literal* hash placed in the template, so cross-record links are made
  # by sharing the same hash object — resolved via the deserializer's identity-based ref lookup, and
  # rendered by `to_yaml` as a YAML anchor/alias.
  class Record
    # @return [String] the template model key, e.g. 'user', 'project', 'project_folders/folder'.
    attr_reader :model_name
    # @return [Hash] the attributes hash placed verbatim in the template.
    attr_reader :attributes
    # @return [String, nil] the "<table>-<id>" key this record was registered under, if any.
    attr_accessor :key

    def initialize(model_name, attributes = {})
      @model_name = model_name
      @attributes = attributes
    end

    # The ActiveRecord class name the deserializer derives from `model_name`
    # (e.g. 'project_folders/folder' => 'ProjectFolders::Folder'), matching the keys of its
    # `created_objects_ids` hash.
    def class_name
      model_name.classify
    end

    # Point an association ref at another record by sharing its attributes hash object.
    #   record.reference('project', project_record) # => attributes['project_ref'] = project_record.attributes
    def reference(association, target_record)
      @attributes["#{association}_ref"] = target_record.attributes
    end
  end
end
