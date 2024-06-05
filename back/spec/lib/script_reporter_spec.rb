require 'rails_helper'

RSpec.describe ScriptReporter do
  describe 'report!' do
    it 'writes the changes and errors' do
      reporter = described_class.new
      # Stub File.open method with double and stub write
      file = double('file')
      allow(file).to receive(:write)
      allow(File).to receive(:open).and_yield(file)

      reporter.report!('test_report.json')
      # Expect file double to have received write method
      expect(file).to have_received(:write).with(
        JSON.pretty_generate({ changes: [], errors: [] })
      )
    end
  end
end
