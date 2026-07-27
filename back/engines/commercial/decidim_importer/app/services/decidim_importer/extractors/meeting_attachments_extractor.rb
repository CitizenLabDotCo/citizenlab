# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim meeting attachments (`06---attachments.csv`, nested in a meeting subdirectory) ──▶ Go Vocal
    # file attachments on the imported `Event`. The row's `attached_to` is the meeting uid (→ event); the
    # shared record shape lives in {AttachmentExtractor}.
    class MeetingAttachmentsExtractor < AttachmentExtractor
      attaches_to 'event', noun: 'meeting'
    end
  end
end
