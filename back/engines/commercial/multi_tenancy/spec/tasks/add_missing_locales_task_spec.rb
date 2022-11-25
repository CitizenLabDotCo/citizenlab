# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'rake add_missing_locales' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['fixes:add_missing_locales'].reenable
  end

  it 'adds the missing Belgian Dutch title and description for an idea status of accepted' do
    create(
      :idea_status,
      code: 'accepted',
      title_multiloc: { 'en' => 'accepted' },
      description_multiloc: { en: 'This idea has been accepted and will be implemented by the city' }
    )
    Rake::Task['fixes:add_missing_locales'].invoke('example.org', 'nl-BE')

    expect(IdeaStatus.first.title_multiloc.length).to eq(2)
    expect(IdeaStatus.first.title_multiloc).to include('nl-BE' => 'aangenomen')
  end

  it 'adds the missing English title for gender custom field' do
    create(:custom_field, key: 'gender', title_multiloc: { 'nl-BE' => 'Geslacht' })
    Rake::Task['fixes:add_missing_locales'].invoke('example.org', 'en')

    expect(CustomField.first.title_multiloc.length).to eq(2)
    expect(CustomField.first.title_multiloc).to include('en' => 'Gender')
  end

  it 'does not overwrite the value for the locale if it exists' do
    create(:custom_field, key: 'gender', title_multiloc: { 'en' => 'TEST_VALUE', 'nl-BE' => 'Geslacht' })
    Rake::Task['fixes:add_missing_locales'].invoke('example.org', 'en')

    expect(CustomField.first.title_multiloc.length).to eq(2)
    expect(CustomField.first.title_multiloc['en']).to eq('TEST_VALUE')
  end

  it 'does nothing if the locale already exists but is empty' do
    create(:custom_field, key: 'gender', title_multiloc: { 'en' => '', 'nl-BE' => 'Geslacht' })
    Rake::Task['fixes:add_missing_locales'].invoke('example.org', 'en')

    expect(CustomField.first.title_multiloc.length).to eq(2)
    expect(CustomField.first.title_multiloc['en']).to eq('')
  end
end
# rubocop:enable RSpec/DescribeClass
