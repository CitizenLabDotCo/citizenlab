# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim proposal attachments (`06---attachments.csv`) ──▶ Go Vocal file attachments on the imported
    # `Idea`. Row's `attached_to` is the proposal uid (→ idea); shared record shape in {AttachmentExtractor}.
    class ProposalAttachmentsExtractor < AttachmentExtractor
      attaches_to 'idea', noun: 'proposal'
    end
  end
end
