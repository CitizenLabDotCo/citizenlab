module Analysis
  module LLM
    class Error < StandardError; end
    class UnsupportedAttachmentError < Error; end
    class PreviewPendingError < Error; end
  end
end
