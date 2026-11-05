# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomForm do
  it_behaves_like 'a sanitized html_multiloc', factory: :custom_form, attribute: :print_start_multiloc
  it_behaves_like 'a sanitized html_multiloc', factory: :custom_form, attribute: :print_end_multiloc

  describe 'multiloc_sanitization' do
    it 'removes <a> tags, but keeps the text between the tags' do
      custom_form = create(
        :custom_form,
        print_start_multiloc: {
          'en' => '<p>Test</p><a href="https://example.com">This link should be removed!</a>'
        },
        print_end_multiloc: {
          'en' => '<p>Test</p><a href="https://example.com">This link should be removed!</a>'
        }
      )
      expect(custom_form.print_start_multiloc).to eq({ 'en' => '<p>Test</p>This link should be removed!' })
      expect(custom_form.print_end_multiloc).to eq({ 'en' => '<p>Test</p>This link should be removed!' })
    end
  end
end
