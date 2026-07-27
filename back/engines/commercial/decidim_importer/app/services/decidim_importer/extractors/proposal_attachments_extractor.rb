# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal attachments (`06---attachments.csv`, nested in a proposals component) ──▶ Go Vocal
    # file attachments on the imported `Idea`. The row's `attached_to` is the proposal uid (→ idea); the
    # shared record shape lives in {AttachmentExtractor}.
    class ProposalAttachmentsExtractor < AttachmentExtractor
      attaches_to 'idea', noun: 'proposal'
    end
  end
end
