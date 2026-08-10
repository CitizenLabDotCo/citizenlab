# frozen_string_literal: true

require 'rails_helper'

describe MachineTranslations::MachineTranslation do
  describe 'translation sanitization on save' do
    it 'strips event-handler attributes from an idea body translation' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<p>hi</p><img src=x onerror=alert(1)>')
      expect(mt.translation).not_to include('onerror')
    end

    it 'strips script tags from an idea body translation' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<p>hi</p><script>alert(1)</script>')
      expect(mt.translation).not_to include('<script>')
    end

    it 'strips all HTML from a title translation' do
      mt = create(:machine_translation, attribute_name: 'title_multiloc', translation: '<img src=x onerror=alert(1)>hi')
      expect(mt.translation).not_to include('onerror')
      expect(mt.translation).not_to include('<img')
    end

    # The two cases below prove the allowlist is derived from the source field: an idea body
    # permits links, a comment body (mention-only) does not.
    it 'keeps links in an idea body translation (idea body allowlist)' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<a href="https://good.example">x</a>')
      expect(mt.translation).to include('href="https://good.example"')
    end

    it 'strips links from a comment body translation (comment mention-only allowlist)' do
      comment = create(:comment)
      mt = create(:machine_translation, translatable: comment, attribute_name: 'body_multiloc',
        translation: '<p>hi</p><a href="https://evil.example">x</a><img src=y onerror=alert(1)>')
      expect(mt.translation).not_to include('onerror')
      expect(mt.translation).not_to include('<a ')
    end
  end
end
