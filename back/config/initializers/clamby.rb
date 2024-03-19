# frozen_string_literal: true

require 'clamby'

Clamby.configure(
  {
    check: false,
    daemonize: true,
    config_file: '/cl2_back/config/clamav/web_clamd.conf',
    error_clamscan_missing: false,
    error_clamscan_client_error: false,
    error_file_missing: false,
    error_file_virus: false
  }
)
