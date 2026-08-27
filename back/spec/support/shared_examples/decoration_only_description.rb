# frozen_string_literal: true

# Shared examples for a `description_multiloc` sanitised on write against
# `DESCRIPTION_SANITIZE_FEATURES` - bold and italic only, which is all the editor offers.
#
# The sanitising rules themselves are specced in spec/services/sanitization_service_spec.rb; these
# examples only assert that the attribute is wired to them, with the narrow allowlist rather than
# the one the other description fields use.
#
# Usage:
#   it_behaves_like 'a decoration-only description', factory: :input_topic
#
# @param factory [Symbol] A factory that accepts `description_multiloc`.
RSpec.shared_examples 'a decoration-only description' do |factory:|
  def stored_description(factory, value)
    create(factory, description_multiloc: { 'en' => value })[:description_multiloc]['en']
  end

  it 'keeps the formatting the editor can produce' do
    expect(stored_description(factory, '<p>Keep <b>bold</b> and <em>italic</em></p>'))
      .to eq '<p>Keep <b>bold</b> and <em>italic</em></p>'
  end

  it 'strips an event-handler payload' do
    expect(stored_description(factory, '<p>hi</p><img src=x onerror=alert(1)>')).to eq '<p>hi</p>'
  end

  it 'strips a script tag, leaving its text inert' do
    expect(stored_description(factory, '<p>hi</p><script>alert(1)</script>')).to eq '<p>hi</p>alert(1)'
  end

  it 'strips markup the editor cannot produce, keeping the words' do
    expect(stored_description(factory, '<h2>Big</h2><p>See <a href="https://example.com">docs</a></p>'))
      .to eq 'Big<p>See docs</p>'
  end
end
