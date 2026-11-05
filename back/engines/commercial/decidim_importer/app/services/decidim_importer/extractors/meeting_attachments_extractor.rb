# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim meeting attachments (`06---attachments.csv`) ──▶ Go Vocal file attachments on the imported
    # `Event`. Row's `attached_to` is the meeting uid (→ event); shared record shape in {AttachmentExtractor}.
    class MeetingAttachmentsExtractor < AttachmentExtractor
      attaches_to 'event', noun: 'meeting'
    end
  end
end
