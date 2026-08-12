# frozen_string_literal: true

# Shared examples for a model whose `title_multiloc` is stripped to plain text on write, because
# a title is plain text that nonetheless reaches HTML render paths.
#
# The stripping rule itself is specced in spec/services/sanitization_service_spec.rb; these
# examples only assert that the model is wired to it.
#
# Usage:
#   it_behaves_like 'a sanitized title_multiloc', factory: :project
#
# @param factory [Symbol] A factory that accepts a `title_multiloc`.
RSpec.shared_examples 'a sanitized title_multiloc' do |factory:|
  it 'strips HTML tags from the title' do
    record = create(factory, title_multiloc: { 'en' => '<b>bold</b> title' })
    expect(record.title_multiloc['en']).to eq 'bold title'
  end

  it 'strips script/event-handler payloads from the title' do
    record = create(factory, title_multiloc: { 'en' => '<img src=x onerror=alert(1)>hi' })
    expect(record.title_multiloc['en']).to eq 'hi'
  end

  # A single `full_sanitizer` pass would leave 'Fish &amp; chips' here.
  it 'strips markup without entity-encoding the text that survives' do
    record = create(factory, title_multiloc: { 'en' => '<b>Fish</b> & chips' })
    expect(record.title_multiloc['en']).to eq 'Fish & chips'
  end
end
