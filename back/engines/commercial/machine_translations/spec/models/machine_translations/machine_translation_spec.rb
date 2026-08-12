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

    it 'leaves ampersands in a title translation as plain text' do
      mt = create(:machine_translation, attribute_name: 'title_multiloc', translation: 'Poisson & frites')
      expect(mt.translation).to eq 'Poisson & frites'
    end

    it 'keeps links in an idea body translation (idea body allowlist)' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<a href="https://good.example">x</a>')
      expect(mt.translation).to include('href="https://good.example"')
    end

    # A comment body allows mentions only, but linkify runs after sanitize - so stored bodies do
    # contain anchors, and a translation of one must keep them.
    it 'keeps linkified URLs in a comment body translation' do
      comment = create(:comment)
      mt = create(:machine_translation, translatable: comment, attribute_name: 'body_multiloc',
        translation: '<p>Voir <a href="https://example.com" target="_blank" rel="noreferrer noopener nofollow">https://example.com</a> ici</p>')
      expect(mt.translation).to include('href="https://example.com"')
    end

    context 'a field with no pipeline of its own' do
      before { allow(ErrorReporter).to receive(:report_msg) }

      it 'falls back to plain text' do
        mt = create(:machine_translation, attribute_name: 'unwired_multiloc', translation: '<p>hi</p><img src=x onerror=alert(1)>')
        expect(mt.translation).to eq 'hi'
      end

      it 'reports the missing pipeline' do
        create(:machine_translation, attribute_name: 'unwired_multiloc')
        expect(ErrorReporter).to have_received(:report_msg).with(
          a_string_including('no sanitize pipeline'),
          extra: hash_including(attribute_name: 'unwired_multiloc')
        )
      end
    end

    it 'does not report a pipeline for a field that has one' do
      allow(ErrorReporter).to receive(:report_msg)
      create(:machine_translation, attribute_name: 'title_multiloc')
      expect(ErrorReporter).not_to have_received(:report_msg)
    end

    it 'rewrites a spoofed anchor in a comment body translation to its visible text' do
      comment = create(:comment)
      mt = create(:machine_translation, translatable: comment, attribute_name: 'body_multiloc',
        translation: '<p>hi</p><a href="https://evil.example">https://google.example</a><img src=y onerror=alert(1)>')
      expect(mt.translation).not_to include('onerror')
      expect(mt.translation).not_to include('evil.example')
      expect(mt.translation).to include('href="https://google.example"')
    end
  end
end
