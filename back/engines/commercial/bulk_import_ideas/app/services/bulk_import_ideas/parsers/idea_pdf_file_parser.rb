# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaPdfFileParser < IdeaBaseFileParser
    IDEAS_PER_JOB = 5
    MAX_TOTAL_PAGES = 100

    # Synchronous version not implemented for PDFs
    def parse_file(file_content)
      raise NotImplementedError, 'This method is not implemented for PDFs'
    end

    # Asynchronous version of the parse_file method
    # Sends 5 files containing 1 idea to each job
    def parse_file_async(file_content)
      files = create_files file_content
      job_ids = []
      job_first_idea_index = 1
      files.each_slice(IDEAS_PER_JOB) do |sliced_files|
        job = BulkImportIdeas::IdeaPdfImportJob.perform_later(sliced_files, @import_user, @locale, @phase, @personal_data_enabled, job_first_idea_index)
        job_ids << job.job_id
        job_first_idea_index += IDEAS_PER_JOB
      end

      job_ids
    end

    private

    def create_files(file_content)
      source_file = upload_source_file file_content

      # Split a pdf into one PDF per idea
      split_pdf_files = []
      if source_file&.import_type == 'pdf'
        # Get number of pages in a form from the exported PDF template
        pages_per_idea = template_data[:page_count]

        pdf = begin
          ::CombinePDF.parse source_file.file.read
        rescue ::CombinePDF::ParsingError
          raise BulkImportIdeas::Error.new 'bulk_import_malformed_pdf', value: source_file.file_content_url
        end

        source_file_page_count = pdf.pages.count
        source_file.update!(num_pages: source_file_page_count)
        raise BulkImportIdeas::Error.new 'bulk_import_maximum_pdf_pages_exceeded', value: MAX_TOTAL_PAGES if source_file_page_count > MAX_TOTAL_PAGES
        raise BulkImportIdeas::Error.new 'bulk_import_not_enough_pdf_pages', value: source_file_page_count if source_file_page_count < pages_per_idea

        new_pdf = ::CombinePDF.new
        new_pdf_count = 0
        pdf.pages.each_with_index do |page, index|
          new_pdf << page
          current_page_num = index + 1
          save_to_file = current_page_num % pages_per_idea == 0

          if save_to_file
            # Temporarily save to a file
            new_pdf_count += 1
            file = Rails.root.join('tmp', "import_#{source_file.id}_#{new_pdf_count}.pdf")
            new_pdf.save file.to_s
            base_64_content = Base64.encode64 file.read
            file.delete

            split_pdf_files << BulkImportIdeas::IdeaImportFile.create!(
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
      split_pdf_files
    end

    # This data is a combination of the form_fields and the context of where those fields are in the PDF
    def template_data
      @template_data ||= BulkImportIdeas::Parsers::Pdf::IdeaPdfTemplateReader.new(@phase, @locale, @personal_data_enabled).template_data
    end
  end
end
