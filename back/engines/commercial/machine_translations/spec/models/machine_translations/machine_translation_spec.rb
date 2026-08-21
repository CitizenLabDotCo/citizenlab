# frozen_string_literal: true

require 'rails_helper'

describe MachineTranslations::MachineTranslation do
  describe 'translation sanitization on save' do
    it 'strips event-handler attributes from an idea body translation' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<p>hi</p><img src=x onerror=alert(1)>')
      expect(mt.translation).to eq '<p>hi</p><img src="x">'
    end

    it 'strips script tags from an idea body translation' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<p>hi</p><script>alert(1)</script>')
      expect(mt.translation).to eq '<p>hi</p>alert(1)'
    end

    it 'strips all HTML from a title translation' do
      mt = create(:machine_translation, attribute_name: 'title_multiloc', translation: '<img src=x onerror=alert(1)>hi')
      expect(mt.translation).to eq 'hi'
    end

    it 'leaves ampersands in a title translation as plain text' do
      mt = create(:machine_translation, attribute_name: 'title_multiloc', translation: 'Poisson & frites')
      expect(mt.translation).to eq 'Poisson & frites'
    end

    # The href survives untouched; only `rel` is rewritten, by the sanitiser's nofollow scrub.
    it 'keeps links in an idea body translation (idea body allowlist)' do
      mt = create(:machine_translation, attribute_name: 'body_multiloc', translation: '<a href="https://good.example">x</a>')
      expect(mt.translation).to eq '<a href="https://good.example" rel="nofollow">x</a>'
    end

    # Every example here translates one comment, spelled out rather than left to the factory. Its
    # author typed a bare URL and `linkify` wrapped it on write, so the stored body - which is what a
    # provider is handed - carries the URL as its own label. The comment pipeline rebuilds links by
    # reading that label, and a provider breaks it by translating the label along with the prose.
    context 'a comment body translation' do
      let(:comment) { create(:comment, body_multiloc: { 'nl-BE' => 'Zie https://boerenvreugd.nl' }) }
      let(:stored_link) { 'Zie <a href="https://boerenvreugd.nl" target="_blank" rel="noreferrer noopener nofollow">https://boerenvreugd.nl</a>' }

      # Dutch comment, Serbian translation - the pairing that transliterates a URL rather than
      # leaving it alone. Sanitizing does not read either locale; they are here to be read by people.
      def translation_of(html)
        create(:machine_translation, translatable: comment, attribute_name: 'body_multiloc',
          locale_to: 'sr-SP', translation: html).translation
      end

      it 'translates a comment whose link label is the URL itself' do
        expect(comment.body_multiloc['nl-BE']).to eq stored_link
      end

      it 'keeps a link the provider returned untranslated' do
        expect(translation_of(stored_link)).to eq stored_link
      end

      it 'puts back the URL a provider transliterated, as the text as well' do
        translated = 'Видети <a href="https://boerenvreugd.nl" target="_blank" rel="noreferrer noopener nofollow">хттпс://боеренвреугд.нл</a>'
        expect(translation_of(translated)).to eq 'Видети <a href="https://boerenvreugd.nl" target="_blank" rel="noreferrer noopener nofollow">https://boerenvreugd.nl</a>'
      end

      # The href is restored as the text, then the link is rebuilt from that text - so a translation
      # shows the address it goes to, exactly as a comment does. A provider that sends an anchor
      # pointing away from the label cannot hide behind it: the label becomes the real address.
      it 'shows the address a link goes to, not the one its label claimed' do
        expect(translation_of('<a href="https://evil.example">https://google.example</a>'))
          .to eq '<a href="https://evil.example" target="_blank" rel="noreferrer noopener nofollow">https://evil.example</a>'
      end

      # The same thing one level up: a provider translates the words in a URL's *path* - `so cerca`
      # into `tan cerca` - leaving a label that points at a page that does not exist. Found in
      # production in four languages (§11.7, §13.4), which is why this example is here rather than
      # dismissed as unrealistic.
      it 'puts back a URL whose path a provider translated' do
        href = 'https://publicoescazu.cepal.org/es/ideas/34581-so-cerca-del-acuerdo-de-escazu'
        label = 'https://publicoescazu.cepal.org/es/ideas/34581-tan-cerca-del-acuerdo-de-escazu'
        attrs = 'target="_blank" rel="noreferrer noopener nofollow"'
        expect(translation_of(%(Видети <a href="#{href}" #{attrs}>#{label}</a>)))
          .to eq %(Видети <a href="#{href}" #{attrs}>#{href}</a>)
      end

      # A provider translates the words inside an address as readily as any others - `duurzaam` into
      # `sustainable` - leaving the label pointing at a mailbox that does not exist. From production.
      it 'puts back an address a provider translated inside the label' do
        translated = 'Mail <a href="mailto:duurzaam@oosterhout.nl" target="_blank" rel="noreferrer noopener nofollow">sustainable@oosterhout.nl</a>'
        expect(translation_of(translated))
          .to eq 'Mail <a href="mailto:duurzaam@oosterhout.nl" target="_blank" rel="noreferrer noopener nofollow">duurzaam@oosterhout.nl</a>'
      end

      # `linkify` finds an email by its address alone and supplies the scheme itself, so a `mailto:`
      # written into the text would sit in front of the rebuilt link - and, being read back off the
      # href, gain another copy on every later save.
      it 'shows an email address with no scheme in front of it, however often it is saved' do
        record = create(:machine_translation, translatable: comment, attribute_name: 'body_multiloc',
          locale_to: 'sr-SP', translation: '<a href="mailto:a@b.com">schrijf ons</a>')
        expect(record.translation).to eq '<a href="mailto:a@b.com" target="_blank" rel="noreferrer noopener nofollow">a@b.com</a>'
        expect { record.save! }.not_to change(record, :translation)
      end

      # Only the schemes `linkify` builds are put back, so this href is never restored as text and the
      # anchor goes the way any other unsupported markup goes.
      it 'still drops a javascript: href' do
        expect(translation_of('<p>hi</p><a href="javascript:alert(1)">click</a>')).to eq '<p>hi</p>click'
      end

      it 'still strips markup a comment body may not carry, links aside' do
        expect(translation_of('<p>hi</p><img src=y onerror=alert(1)><script>alert(1)</script>'))
          .to eq '<p>hi</p>alert(1)'
      end
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
  end
end
