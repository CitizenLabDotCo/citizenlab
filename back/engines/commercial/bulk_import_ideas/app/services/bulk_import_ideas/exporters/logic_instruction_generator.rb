# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class LogicInstructionGenerator
    def initialize(printable_fields, all_fields, locale)
      @printable_fields = printable_fields
      @all_fields = all_fields
      @locale = locale
      build_logic_maps
    end

    # Returns the title with section label prefix for pages
    def field_title(field, default_title)
      return default_title unless field.page?

      section_label = @section_labels[field.id]
      return default_title if section_label.blank?

      raw_title = field.title_multiloc[@locale]
      raw_title.present? ? "#{section_label}: #{raw_title}" : section_label
    end

    # Returns option title with letter prefix (A), B), C)...) for selection fields
    def option_title(field, option, index)
      title = option.title_multiloc[@locale]
      if field.supports_single_selection? || field.supports_multiple_selection?
        title = "#{index_to_letter(index)}) #{title}"
      end
      title
    end

    # Attach logic instruction HTML to the last field before each page boundary
    def attach_logic_instructions(fields)
      page_groups = fields.slice_before { |f| f[:input_type] == 'page' }.to_a

      page_groups.each do |group|
        page_field = group.find { |f| f[:input_type] == 'page' }
        next unless page_field

        logic_fields = @logic_fields_per_page[page_field[:id]]
        next if logic_fields.blank?

        instructions_html = build_logic_instructions_html(logic_fields, fields)
        next if instructions_html.blank?

        # Attach to the last question, or to the page itself if there are no questions
        target = group.reverse.find { |f| f[:input_type] != 'page' } || page_field
        target[:logic_instructions] = instructions_html
      end
    end

    private

    def build_logic_maps
      @section_labels = {}
      @printable_fields.select(&:page?).each_with_index do |page, index|
        @section_labels[page.id] = logic_t('logic_section', letter: index_to_letter(index))
      end

      @option_id_map = {}
      @printable_fields.each do |field|
        field.options.each { |opt| @option_id_map[opt.id] = opt }
      end

      @logic_fields_per_page = Hash.new { |h, k| h[k] = [] }
      current_page_id = nil
      @printable_fields.each do |field|
        if field.page?
          current_page_id = field.id
          @logic_fields_per_page[current_page_id] << field if field.logic? && field.logic['next_page_id'].present?
        elsif field.logic? && field.logic['rules'].present?
          @logic_fields_per_page[current_page_id] << field
        end
      end
    end

    def index_to_letter(index)
      ('A'..'Z').to_a[index] || (index + 1).to_s
    end

    def build_logic_instructions_html(logic_fields, field_hashes)
      lines = logic_fields.flat_map do |field|
        if field.page?
          page_logic_instruction(field)
        else
          question_logic_instructions(field, field_hashes)
        end
      end

      lines.compact.join('<br>')
    end

    def page_logic_instruction(field)
      target_id = field.logic['next_page_id']
      if end_page?(target_id)
        "<em>#{logic_t('logic_no_further_questions')}</em>"
      else
        label = @section_labels[target_id]
        "<em>#{logic_t('logic_go_to_section', section: label)}</em>" if label
      end
    end

    def question_logic_instructions(field, field_hashes)
      question_num = field_hashes.find { |f| f[:id] == field.id }&.dig(:question_number_int)
      return [] unless question_num

      sorted_rules = field.logic['rules']&.sort_by do |rule|
        opt = @option_id_map[rule['if'].to_s]
        opt ? field.options.index(opt) : Float::INFINITY
      end

      sorted_rules&.filter_map do |rule|
        option = @option_id_map[rule['if'].to_s]
        next unless option

        letter = index_to_letter(field.options.index(option))
        target_id = rule['goto_page_id']

        if end_page?(target_id)
          "<em>#{logic_t('logic_if_answered_end', option: letter, question: question_num)}</em>"
        else
          label = @section_labels[target_id]
          "<em>#{logic_t('logic_if_answered_go_to', option: letter, question: question_num, section: label)}</em>" if label
        end
      end
    end

    def end_page?(page_id)
      @all_fields.find { |f| f.id == page_id }&.form_end_page?
    end

    def logic_t(key, **params)
      I18n.with_locale(@locale) { I18n.t("form_builder.pdf_export.#{key}", **params) }
    end
  end
end
