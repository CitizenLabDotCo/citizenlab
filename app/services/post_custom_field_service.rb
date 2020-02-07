class PostCustomFieldService

  def merge_built_in_fields custom_fields_scope
    custom_fields = custom_fields_scope.to_a
    codes = custom_fields.map(&:code)
    [
      *custom_fields,
      *build_built_in_fields.reject do |custom_field|
        codes.include?(custom_field.code)
      end
    ]
  end

  def find_or_build_field post_form, code
    CustomField.find_by(code: code) ||
      build_built_in_fields.find{|bicf| bicf.code == code}
  end

  private
    
  def build_built_in_fields
    ml_s = MultilocService.new
    [
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'title',
        code: 'title',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.title.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin 
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.title.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue 
            {}
          end,
        required: true,
        enabled: true
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'topic_ids',
        code: 'topic_ids',
        input_type: 'multiselect',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.topic_ids.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin 
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.topic_ids.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue 
            {}
          end,
        required: false,
        enabled: true
      ),
    ]
  end
end
