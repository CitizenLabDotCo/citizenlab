# frozen_string_literal: true

require 'clamby'

Clamby.configure(
  {
    check: true,
    daemonize: true,
    config_file: '/cl2_back/config/clamav/web_clamd.conf',
    output_level: 'high',
    error_clamscan_missing: true,
    error_clamscan_client_error: true,
    error_file_missing: true,
    error_file_virus: true
  }
)
