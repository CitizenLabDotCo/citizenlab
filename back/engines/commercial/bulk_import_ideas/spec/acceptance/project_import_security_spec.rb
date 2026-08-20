# frozen_string_literal: true

require 'rails_helper'
require 'zip'
require 'base64'

# Regression tests for the project-import Zip Slip / broken-authorization fix.
# Two properties are checked:
#   1. A non-admin resident cannot reach extraction (authorization runs first).
#   2. A path-traversal entry cannot write outside the import directory, even for
#      an authorized admin (the containment guard).

resource 'Project import security (Zip Slip / authorization)' do
  explanation 'A file must not be written outside the import directory, and only authorized users may import.'
  header 'Content-Type', 'application/json'

  # Path the traversal targets. Rails.root is back/ ; the import dir is tmp/import_files.
  let(:marker_path) { Rails.root.join('public', 'zip_slip_regression_marker.html').to_s }

  def zip_with_entry(name, body)
    buffer = Zip::OutputStream.write_buffer do |zos|
      zos.put_next_entry(name)
      zos.write(body)
    end
    buffer.rewind
    "data:application/zip;base64,#{Base64.strict_encode64(buffer.read)}"
  end

  before { FileUtils.rm_f(marker_path) }
  after  { FileUtils.rm_f(marker_path) }

  post 'web_api/v1/importer/bulk_create_async/projects' do
    with_options scope: :import do
      parameter :file, 'base64-encoded zip (data URI)'
      parameter :locale
      parameter :preview
    end

    let(:file) { zip_with_entry('../../public/zip_slip_regression_marker.html', '<script>x</script>MARKER') }
    let(:locale) { 'en' }
    let(:preview) { true }

    context 'as a plain resident (non-admin)' do
      before { header_token_for create(:user) }

      example 'is unauthorized and writes nothing outside the import dir' do
        do_request
        expect(status).to eq(401)
        expect(File.exist?(marker_path)).to be(false)
      end
    end

    context 'as an admin with a path-traversal entry' do
      before { header_token_for create(:admin) }

      example 'is rejected by the containment guard and writes nothing outside the import dir' do
        error = nil
        begin
          do_request
        rescue StandardError => e
          error = e
        end
        # The guard aborts the request before the file is extracted.
        expect(error).to be_a(BulkImportIdeas::Error)
        expect(File.exist?(marker_path)).to be(false)
      end
    end
  end
end
