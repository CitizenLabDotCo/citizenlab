# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomForm do
  describe 'multiloc_sanitization' do
    it 'sanitizes script tags in the description' do
      custom_form = create(
        :custom_form,
        print_start_multiloc: {
          'en' => '<p>Test</p><script>These tags should be removed!</script>'
        },
        print_end_multiloc: {
          'en' => '<p>Test</p><script>These tags should be removed!</script>'
        }
      )

      expect(custom_form.print_start_multiloc).to eq({ 'en' => '<p>Test</p>These tags should be removed!' })
    end

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
