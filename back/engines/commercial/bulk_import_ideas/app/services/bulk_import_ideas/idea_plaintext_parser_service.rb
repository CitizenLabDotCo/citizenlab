module BulkImportIdeas
  class IdeaPlaintextParserService
    QUESTION_TYPES = %w[select multiselect text text_multiloc multiline_text html_multiloc]

    def initialize(project_id, locale)
      @project = Project.find(project_id)
      @custom_fields = IdeaCustomFieldsService.new(
          Factory.instance.participation_method_for(@project).custom_form
        )
        .enabled_fields
        .select { |field| QUESTION_TYPES.include? field.input_type }

      @locale = locale || @locale

      @optional_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.optional') }
      @choose_as_many_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.choose_as_many') }
      @this_answer_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.this_answer') }

      @first_field_display_title = nil
      @fields_by_display_title = {}

      @custom_fields.each_with_index do |field, i|
        title = field.title_multiloc[@locale]

        display_title = field.required? ? title : "#{title} (#{@optional_copy})"

        if i == 0 then
          @first_field_display_title = display_title
        end

        @fields_by_display_title[display_title] = field
      end
    end

    def parse_text(text)
      lines = text.lines.map { |line| line.rstrip }

      # documents is an array of forms.
      # A form is a hash with the field title
      # as key, and the detected answer as value.
      # If no answer is found it is set to nil
      documents = []
      form = nil

      current_field_display_title = nil
      current_custom_field = nil

      lines.each do |line|
        next if is_disclaimer? line

        if is_new_document? line then
          documents << form unless form.nil?
          form = {}
        end

        if is_field_title? line then
          form[line] = nil

          current_field_display_title = line
          current_custom_field = lookup_field(line)
          next
        end

        field_type = current_custom_field.input_type

        if ['text', 'text_multiloc'].include? field_type then
          current_text = form[current_field_display_title]
          form[current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
        end
  
        if ['multiline_text', 'html_multiloc'].include? field_type then
          current_text = form[current_field_display_title]
          form[current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
        end

        if field_type == 'select' then
          # TODO
        end

        if field_type == 'multiselect' then
          # TODO
        end
      end

      documents << form

      return documents
    end

    private

    def is_new_document?(line)
      # Currently returns true if the line equals the first question.
      # In the future some other way of determining the start
      # of the document might be used, like the project/phase title or something
      line == @first_field_display_title
    end

    def is_field_title?(line)
      @fields_by_display_title.key? line
    end

    def lookup_field(line)
      @fields_by_display_title[line]
    end

    def is_disclaimer?(line)
      line == "*#{@choose_as_many_copy}" || line == "*#{@this_answer_copy}"
    end
  end
end