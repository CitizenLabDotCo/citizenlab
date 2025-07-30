# frozen_string_literal: true

class Files::SideFxFileService < BaseSideFxService
  def resource_name = 'file'

  def after_create(file, user)
    super

    Files::PreviewService.new.enqueue_preview(file)
    Files::TranscriptService.new(file).enqueue_transcript
  end
end
