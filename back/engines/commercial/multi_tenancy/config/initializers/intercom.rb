# frozen_string_literal: true

INTERCOM_EVENT_WHITELIST = File.readlines(File.join(File.dirname(__FILE__),
  '../intercom-event-whitelist.txt')).map(&:strip)
