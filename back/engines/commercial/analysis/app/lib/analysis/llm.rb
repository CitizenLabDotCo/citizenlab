module Analysis
  module LLM
    class Error < StandardError; end
    class UnsupportedAttachmentError < Error; end
    class TooManyImagesError < Error; end
    class PreviewPendingError < Error; end
    class TooManyRequestsError < Error; end
  end
end
