# frozen_string_literal: true

module BulkImportIdeas
  class IdeaPdfFileParser < IdeaBaseFileParser
    PAGES_TO_TRIGGER_NEW_PDF = 8
    MAX_TOTAL_PAGES = 50

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into smaller documents
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the download
        pages_per_idea = @input_form_data[:page_count]

        pdf = ::CombinePDF.parse URI.open(source_file.file_content_url).read
        source_file.update!(num_pages: pdf.pages.count)
        raise Error.new 'bulk_import_ideas_maximum_pdf_pages_exceeded', value: pdf.pages.count if pdf.pages.count > MAX_TOTAL_PAGES

        return [source_file] if pdf.pages.count <= PAGES_TO_TRIGGER_NEW_PDF # Only need to split if the file is too big

        new_pdf = ::CombinePDF.new
        new_pdf_count = 0
        pdf.pages.each_with_index do |page, index|
          new_pdf << page
          current_page_num = index + 1
          save_to_file =
            (current_page_num % pages_per_idea == 0 && new_pdf.pages.count >= PAGES_TO_TRIGGER_NEW_PDF) ||
            (current_page_num == pdf.pages.count)

          if save_to_file
            # Temporarily save to a file
            new_pdf_count += 1
            file = Rails.root.join('tmp', "import_#{source_file.id}_#{new_pdf_count}.pdf")
            new_pdf.save file.to_s
            base_64_content = Base64.encode64 file.read
            file.delete

            split_pdf_files << IdeaImportFile.create!(
              import_type: source_file.import_type,
              project: @project,
              num_pages: new_pdf.pages.count,
              parent: source_file,
              file_by_content: {
                name: "import_#{new_pdf_count}.pdf",
                content: "data:application/pdf;base64,#{base_64_content}"
              }
            )
            new_pdf = ::CombinePDF.new
          end
        end
      end
      split_pdf_files.presence || [source_file]
    end

    def parse_rows(file)
      parsed_ideas = parse_pdf_ideas(file)
      merge_pdf_rows(parsed_ideas)
    end

    private

    def merge_pdf_rows(parsed_ideas)
      form_parsed_ideas = ideas_to_idea_rows(parsed_ideas[:form_parsed_ideas])
      text_parsed_ideas = ideas_to_idea_rows(parsed_ideas[:text_parsed_ideas])

      return form_parsed_ideas unless form_parsed_ideas.count == text_parsed_ideas.count

      form_parsed_ideas.each_with_index.map do |idea, index|
        idea[:custom_field_values] = text_parsed_ideas[index][:custom_field_values].merge(idea[:custom_field_values])
        idea[:pdf_pages] = complete_page_range(idea[:pdf_pages], text_parsed_ideas[index][:pdf_pages])
        text_parsed_ideas[index].merge(idea)
      end
    end

    def parse_pdf_ideas(file)
      pdf_file = URI.open(file.file_content_url).read
      @google_forms_service ||= Pdf::IdeaGoogleFormParserService.new

      # NOTE: We return both parsed values so we can later merge the best values from both
      form_parsed_ideas = @google_forms_service.parse_pdf(pdf_file, @input_form_data[:page_count])

      text_parsed_ideas = begin
                            Pdf::IdeaPlainTextParserService.new(
          @phase || @project,
          @form_fields.reject { |field| field.input_type == 'topic_ids' }, # Temp
          @locale,
          @input_form_data[:page_count]
        ).parse_text(@google_forms_service.raw_text_page_array(pdf_file))
      rescue BulkImportIdeas::Error
        []
      end

      {
        form_parsed_ideas: form_parsed_ideas,
        text_parsed_ideas: text_parsed_ideas
      }
    end

    def complete_page_range(pages1, pages2)
      min = [pages1.min, pages2.min].min
      max = [pages1.max, pages2.max].max
      (min..max).to_a
    end

    # Return the fields and page count from the form we're importing from
    def import_form_data(personal_data_enabled)
      IdeaPdfFormExporter.new(@phase, @locale, personal_data_enabled).importer_data
    end
  end
end
