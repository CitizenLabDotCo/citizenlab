# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomFieldMatrixStatement do
  subject { build(:custom_field_matrix_statement) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  it { is_expected.to belong_to(:custom_field) }
  it { is_expected.to validate_presence_of(:title_multiloc) }

  it do
    # Create a matrix statement without a title so generate_key won't run
    subject = build(:custom_field_matrix_statement, title_multiloc: {})
    expect(subject).to validate_presence_of(:key)
  end

  it { is_expected.to validate_uniqueness_of(:key).scoped_to(:custom_field_id) }

  describe '#sanitize_title_multiloc' do
    it 'removes all HTML tags from title_multiloc' do
      cfms = build(
        :custom_field_matrix_statement,
        title_multiloc: {
          'en' => 'Thing <script>alert("XSS")</script> something',
          'fr-BE' => 'Something <img src=x onerror=alert(1)>',
          'nl-BE' => 'Plain <b>text</b> with <i>formatting</i>'
        }
      )

      cfms.save!

      expect(cfms.title_multiloc['en']).to eq('Thing alert("XSS") something')
      expect(cfms.title_multiloc['fr-BE']).to eq('Something ')
      expect(cfms.title_multiloc['nl-BE']).to eq('Plain text with formatting')
    end
  end
end
