# frozen_string_literal: true

class TemplateService
  def initialize
    @template_refs = {}
  end

  protected

  def lookup_ref(id, model_name)
    return nil unless id

    if model_name.is_a?(Array)
      model_name.each do |one_model_name|
        return @template_refs.dig(one_model_name, id) if @template_refs.dig(one_model_name, id)
      end
      nil
    else
      # `dig` so an optional ref to a model that wasn't exported (e.g. a file uploader
      # when users aren't part of the export) yields nil instead of raising.
      @template_refs.dig(model_name, id)
    end
  end

  def store_ref(yml_object, id, model_name)
    @template_refs[model_name] ||= {}
    @template_refs[model_name][id] = yml_object
  end

  def filter_custom_field_values(custom_field_values, custom_fields)
    # Templates do not support ID references.

    supported_fields = custom_fields.select do |field|
      %w[file_upload shapefile_upload].exclude? field.input_type
    end
    custom_field_values.slice(*supported_fields.map(&:key))
  end

  def exportable_image_url(uploader)
    return uploader.url if stored?(uploader)

    fallback = [uploader.versions[:large], *uploader.versions.values]
      .compact
      .find { |version| stored?(version) }
    return unless fallback

    Rails.logger.warn(
      'Original image missing, exporting a resized version instead',
      identifier: uploader.identifier, version: fallback.version_name
    )
    fallback.url
  end

  # Whether the file is actually present in the storage backend (an S3 HEAD request in
  # production). This cannot be inferred from the URL: fog builds it by concatenating the
  # asset host and the stored identifier, without ever hitting S3, so a deleted object
  # still yields a perfectly well-formed URL. A storage error is treated as "not stored"
  # rather than propagated, so that a transient S3 failure cannot break a whole export.
  def stored?(uploader)
    uploader.file&.exists?
  rescue StandardError => e
    ErrorReporter.report(e, extra: { identifier: uploader.identifier })
    false
  end
end
