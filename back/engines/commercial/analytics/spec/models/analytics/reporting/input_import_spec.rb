# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::Reporting::InputImport do
  let(:admin) { create(:admin) }

  it 'exposes a FormSync PDF import, with the reader that parsed it' do
    file = create(:idea_import_file, import_type: 'pdf', parsed_value: { 'parser' => 'claude-sonnet', 'value' => {} })
    import = create(
      :idea_import,
      file: file,
      import_user: admin,
      user_created: true,
      approved_at: Time.zone.parse('2026-05-04 09:00')
    )
    row = described_class.find(import.id)

    expect(row).to have_attributes(
      input_id: import.idea_id,
      source: 'pdf',
      parser: 'claude-sonnet',
      user_id: admin.id,
      user_created: true,
      locale: 'en',
      approved_at: Time.zone.parse('2026-05-04 09:00')
    )
  end

  it 'exposes a spreadsheet import without a parser' do
    file = create(:idea_import_file, import_type: 'xlsx')
    import = create(:idea_import, file: file)

    expect(described_class.find(import.id)).to have_attributes(source: 'xlsx', parser: nil)
  end

  it 'keeps an import without a file' do
    import = create(:idea_import, file: nil, import_user: nil)

    expect(described_class.find(import.id)).to have_attributes(source: nil, parser: nil, user_id: nil)
  end

  it 'excludes imports that are still drafts' do
    import = create(:idea_import, idea: create(:idea, publication_status: 'draft'))

    expect(described_class.where(id: import.id)).to be_empty
  end
end
