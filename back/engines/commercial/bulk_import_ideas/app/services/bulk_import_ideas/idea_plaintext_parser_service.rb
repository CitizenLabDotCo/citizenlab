module BulkImportIdeas
  class IdeaPlaintextParserService
    def initialize(project_id, locale)
      @project = Project.find(project_id)
      @custom_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@project).custom_form).enabled_fields
      @locale = locale || @locale

      @optional_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.optional') }

      @first_field_display_title = nil
      @fields_by_display_title = {}

      @custom_fields.each_with_index do |field, i|
        title = field.title_multiloc[@locale]
        display_title = field.required
          ? title
          : "#{title} (#{@optional_copy})"

        if i == 0 then
          @first_field_display_title = display_title
        end

        @fields_by_display_title[display_title] = field
      end
    end

    def parse_text(text)
      lines = text.split('/n')

      # documents is an array of forms.
      # A form is a hash with the field title
      # as key, and the detected answer as value.
      # If no answer is found it is set to nil
      documents = []
      form = nil
      current_field_title = nil

      lines.each do |line|
        if is_new_document(line) then
          documents << form unless form.nil?
          form = {}
        end

        if is_field_title(line) then
          form[line] = nil
          current_field_title = line
          next
        end
      end
    end

    private

    def is_new_document(line)
      # Currently returns true if the line equals the first question.
      # In the future some other way of determining the start
      # of the document might be used, like the project/phase title or something
      line == @first_field_display_title
    end

    def is_field_title(line)
      @fields_by_display_title.key? line
    end

    def lookup_field(line)
      @fields_by_display_title[line]
    end
  end
end