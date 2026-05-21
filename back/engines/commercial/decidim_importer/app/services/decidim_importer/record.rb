# frozen_string_literal: true

module DecidimImporter
  # An intermediate, storage-agnostic representation of a single record that will end up in the
  # tenant template. `attributes` is the *literal* hash that gets placed in the template, so
  # cross-record links are made by sharing the exact same hash object (which the template
  # deserializer resolves through its identity-based ref lookup, and which `to_yaml` renders as a
  # YAML anchor/alias).
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

    # The ActiveRecord class name the deserializer will derive from `model_name`
    # (e.g. 'project_folders/folder' => 'ProjectFolders::Folder'). Matches the keys of the
    # `created_objects_ids` hash returned by the deserializer.
    def class_name
      model_name.classify
    end

    # Point an association ref at another record by sharing its attributes hash object.
    #   record.reference('project', project_record) # => attributes['project_ref'] = project_record.attributes
    def reference(association, target_record)
      @attributes["#{association}_ref"] = target_record.attributes
    end

    # Point a nested-attributes ref (e.g. an admin_publication parent) at a nested hash object.
    #   record.reference_attributes('admin_publication.parent', folder.admin_publication_attributes)
    def reference_nested(association, target_hash)
      @attributes["#{association}_attributes_ref"] = target_hash
    end
  end
end
