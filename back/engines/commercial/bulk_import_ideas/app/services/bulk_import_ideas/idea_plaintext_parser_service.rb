module BulkImportIdeas
  class IdeaPlaintextParserService
    QUESTION_TYPES = %w[select multiselect text text_multiloc multiline_text html_multiloc]
    EMPTY_SELECT_CIRCLES = ["O", "○"]

    def initialize(project_id, locale, phase_id)
      @project = Project.find(project_id)
      @phase = phase_id ? @project.phases.find(phase_id) : TimelineService.new.current_phase(@project)
      @custom_fields = IdeaCustomFieldsService.new(
          Factory.instance.participation_method_for(@phase || @project).custom_form
        )
        .enabled_fields
        .select { |field| QUESTION_TYPES.include? field.input_type }

      @locale = locale || @locale

      binding.pry

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

        field_type = current_custom_field&.input_type

        if ['text', 'text_multiloc'].include? field_type then
          current_text = form[current_field_display_title]
          form[current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
        end
  
        if ['multiline_text', 'html_multiloc'].include? field_type then
          current_text = form[current_field_display_title]
          form[current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
        end

        if field_type == 'select' then
          # So far it seems like for the answer left blank an
          # O or circle symbol is prepended. For the selected
          # answer, either nothing or a random character is used. E.g.

          # "○ A lot"
          # "① Not at all" << the answer selected on the form

          # or:
          # "O A lot" + 
          # "Not at all" << the answer selected on the form

          # So for now we will detect
          # which option titles match these kind of O
          # or circle symbols, and assume the others are the
          # select answer

          option_titles = current_custom_field
            .options
            .pluck(:title_multiloc)
            .map { |multiloc| multiloc[@locale] }

          unless is_empty_select_circle?(line, option_titles) then
            if form[current_field_display_title].nil? then
              form[current_field_display_title] = []
            end

            form[current_field_display_title] << match_selected_option(
              line,
              option_titles
            )
          end
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

    # Checks if string has format '○ option label' or 'O option label'
    def is_empty_select_circle?(line, option_titles)
      first_character = line[0,1]
      second_character = line[1,1]
      rest = line[2,line.length - 2]

      return false unless EMPTY_SELECT_CIRCLES.include? first_character
      return false unless second_character == ' '
      return option_titles.include? rest
    end

    def match_selected_option(line, option_titles)
      line_without_first_chars = line[2,line.length - 2]

      option_titles.find do |option| 
        option == line || option == line_without_first_chars
      end
    end
  end
end