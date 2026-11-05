# frozen_string_literal: true

require 'rails_helper'

describe BulkImportIdeas::Extractors::UserExtractor do
  let(:service) { described_class.new('en', nil, nil) }

  describe '#extract_project_user_data' do
    let(:users) { [] }
    let(:user_custom_fields) { [] }
    let(:base_project_data) do
      {
        title_multiloc: { 'en' => 'Test Project' },
        phases: []
      }
    end

    it 'returns empty arrays when no user data exists' do
      projects = [base_project_data]
      result_users, result_custom_fields = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users).to be_empty
      expect(result_custom_fields).to be_empty
    end

    it 'extracts user data from idea rows' do
      projects = [{
        **base_project_data,
        phases: [{
          idea_rows: [{
            'Email address' => 'moc_elpmaxe_tset@example.com',
            'First name(s)' => 'John',
            'Last name' => 'Doe'
          }]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users.length).to eq(1)
      expect(result_users.first).to include(
        'Email address' => 'moc_elpmaxe_tset@example.com',
        'First name(s)' => 'John',
        'Last name' => 'Doe'
      )
    end

    it 'does not duplicate users with the same email' do
      existing_user = {
        'Email address' => 'test@example.com',
        'First name(s)' => 'John',
        'Last name' => 'Doe'
      }
      projects = [{
        **base_project_data,
        phases: [{
          idea_rows: [existing_user.dup]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, [existing_user], user_custom_fields)
      expect(result_users.length).to eq(1)
    end

    it 'merges user custom fields from phases if idea_rows are present' do
      custom_field = {
        title_multiloc: { 'en' => 'Custom Field' },
        key: 'custom_field'
      }
      projects = [{
        **base_project_data,
        phases: [{
          user_custom_fields: [custom_field],
          idea_rows: [{ 'Organization' => 'ACME Corp' }]
        }]
      }]

      _, result_custom_fields = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_custom_fields).to include(custom_field)
    end

    it 'extracts user custom field values from idea rows' do
      custom_field = {
        title_multiloc: { 'en' => 'Organization' },
        key: 'organization'
      }
      projects = [{
        **base_project_data,
        phases: [{
          user_custom_fields: [custom_field],
          idea_rows: [{
            'Email address' => 'test@example.com',
            'Organization' => 'ACME Corp'
          }]
        }]
      }]

      result_users, = service.send(:extract_project_user_data, projects, users, user_custom_fields)
      expect(result_users.first['Organization']).to eq('ACME Corp')
    end
  end

  describe '#extract_full_name_to_first_last' do
    it 'returns the first and last name unchanged if first and last names are present' do
      row = {
        'Full name' => 'Gary Smith',
        'First name(s)' => 'John',
        'Last name' => 'Doe',
        'Email address' => 'test@example.com'
      }
      result = service.send(:extract_full_name_to_first_last, row)
      expect(result).to eq({
        'First name(s)' => 'John',
        'Last name' => 'Doe',
        'Email address' => 'test@example.com'
      })
    end

    it 'returns the first and last names unchanged if full name is blank' do
      row = {
        'Full name' => '',
        'First name(s)' => 'John',
        'Email address' => 'test@example.com'
      }
      result = service.send(:extract_full_name_to_first_last, row)
      expect(result).to eq({
        'First name(s)' => 'John',
        'Email address' => 'test@example.com'
      })
    end

    it 'splits full name into first and last names' do
      row = {
        'Full name' => 'John Michael Doe',
        'Email address' => 'test@example.com'
      }
      result = service.send(:extract_full_name_to_first_last, row)
      expect(result).to eq({
        'First name(s)' => 'John Michael',
        'Last name' => 'Doe',
        'Email address' => 'test@example.com'
      })
    end
  end
end
