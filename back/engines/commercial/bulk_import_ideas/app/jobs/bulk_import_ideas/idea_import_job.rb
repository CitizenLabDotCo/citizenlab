# frozen_string_literal: true

module BulkImportIdeas
  class IdeaImportJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 60
    perform_retries false

    FORMAT_CONFIG = {
      'pdf' => {
        child_job_class: IdeaPdfImportJob,
        batch_size: Parsers::IdeaPdfFileParser::IDEAS_PER_JOB,
        first_idea_index: 1,
        index_step: Parsers::IdeaPdfFileParser::IDEAS_PER_JOB
      },
      'xlsx' => {
        child_job_class: IdeaXlsxImportJob,
        batch_size: 1,
        first_idea_index: 2,
        index_step: Parsers::IdeaXlsxFileParser::MAX_ROWS_PER_XLSX
      }
    }.freeze

    def run(files, import_user, locale, phase, personal_data_enabled, format)
      config = FORMAT_CONFIG.fetch(format)
      batches = files.each_slice(config[:batch_size]).to_a

      update_tracker_total(files.size)

      first_idea_index = config[:first_idea_index]
      batches.each do |batch|
        enqueue_child_job(config[:child_job_class], batch, import_user, locale, phase, personal_data_enabled, first_idea_index)
        first_idea_index += config[:index_step]
      end
    end

    private

    def job_tracking_context
      arguments[3] # phase
    end
  end
end
