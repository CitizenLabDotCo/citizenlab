require 'rails_helper'

RSpec.describe ScriptReporter do
  describe 'report!' do
    it 'writes the changes and errors' do
      reporter = described_class.new

      allow(File).to receive(:write)

      reporter.add_change('old-title', 'new-title', context: { page: 'my-page', attribute: 'title' })
      reporter.add_change('old-body', 'new-body', context: { page: 'my-page', attribute: 'body' })
      reporter.add_change('old-title', 'new-title', context: { page: 'your-page', attribute: 'title' })
      reporter.add_error('not my page error', context: { page: 'your-page', attribute: 'title' })

      reporter.report!('test_report.json')

      expected_changes = [
        { old_value: 'old-title', new_value: 'new-title', context: { page: 'my-page', attribute: 'title' } },
        { old_value: 'old-body', new_value: 'new-body', context: { page: 'my-page', attribute: 'body' } },
        { old_value: 'old-title', new_value: 'new-title', context: { page: 'your-page', attribute: 'title' } }
      ]
      expected_errors = [
        { error: 'not my page error', context: { page: 'your-page', attribute: 'title' } }
      ]
      expect(File).to have_received(:write).with(
        'test_report.json',
        JSON.pretty_generate({ changes: expected_changes, errors: expected_errors })
      )
    end
  end
end
