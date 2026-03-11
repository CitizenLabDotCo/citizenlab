# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class PdfFileSplitter
    MAX_TOTAL_PAGES = 100

    def initialize(project:, pages_per_idea:)
      @project = project
      @pages_per_idea = pages_per_idea
    end

    # Takes a source IdeaImportFile, splits it into one PDF file per idea.
    # Returns array of split IdeaImportFile records.
    def split(source_file)
      pdf = parse_pdf(source_file)
      validate_page_count!(pdf, source_file)
      split_into_idea_files(pdf, source_file)
    end

    private

    def parse_pdf(source_file)
      ::CombinePDF.parse source_file.file.read
    rescue ::CombinePDF::ParsingError
      raise BulkImportIdeas::Error.new 'bulk_import_malformed_pdf', value: source_file.file_content_url
    end

    def validate_page_count!(pdf, source_file)
      source_file_page_count = pdf.pages.count
      source_file.update!(num_pages: source_file_page_count)
      raise BulkImportIdeas::Error.new 'bulk_import_maximum_pdf_pages_exceeded', value: MAX_TOTAL_PAGES if source_file_page_count > MAX_TOTAL_PAGES
      raise BulkImportIdeas::Error.new 'bulk_import_not_enough_pdf_pages', value: source_file_page_count if source_file_page_count < @pages_per_idea
    end

    def split_into_idea_files(pdf, source_file)
      split_pdf_files = []
      new_pdf = ::CombinePDF.new
      new_pdf_count = 0

      pdf.pages.each_with_index do |page, index|
        new_pdf << page
        current_page_num = index + 1

        next unless current_page_num % @pages_per_idea == 0

        new_pdf_count += 1
        split_pdf_files << save_split_file(new_pdf, new_pdf_count, source_file)
        new_pdf = ::CombinePDF.new
      end

      split_pdf_files
    end

    def save_split_file(pdf, count, source_file)
      tmp_file = Rails.root.join('tmp', "import_#{source_file.id}_#{count}.pdf")
      pdf.save tmp_file.to_s
      base_64_content = Base64.encode64 tmp_file.read
      tmp_file.delete

      BulkImportIdeas::IdeaImportFile.create!(
        import_type: source_file.import_type,
        project: @project,
        num_pages: pdf.pages.count,
        parent: source_file,
        file_by_content: {
          name: "import_#{count}.pdf",
          content: "data:application/pdf;base64,#{base_64_content}"
        }
      )
    end
  end
end
