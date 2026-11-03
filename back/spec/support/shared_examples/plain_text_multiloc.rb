# frozen_string_literal: true

# Shared examples for a multiloc attribute stripped to plain text on write (`PlainTextMultiloc`).
#
# The stripping rule itself is specced in spec/services/sanitization_service_spec.rb; these
# examples only assert that the attribute is wired to it.
#
# Usage:
#   it_behaves_like 'a plain text multiloc', factory: :project
#   it_behaves_like 'a plain text multiloc', factory: :event, attribute: :location_multiloc
#
# @param factory [Symbol] A factory that accepts the attribute.
# @param attribute [Symbol] The multiloc attribute to check.
RSpec.shared_examples 'a plain text multiloc' do |factory:, attribute: :title_multiloc|
  # The raw column, not the reader: `CustomField` and `EmailCampaigns::Campaign` compute theirs.
  def stored(factory, attribute, value)
    create(factory, attribute => { 'en' => value })[attribute]['en']
  end

  it "strips HTML tags from #{attribute}" do
    expect(stored(factory, attribute, '<b>bold</b> text')).to eq 'bold text'
  end

  it "strips script/event-handler payloads from #{attribute}" do
    expect(stored(factory, attribute, '<img src=x onerror=alert(1)>hi')).to eq 'hi'
  end

  # A single `full_sanitizer` pass would leave 'Fish &amp; chips' here.
  it "strips markup from #{attribute} without entity-encoding the text that survives" do
    expect(stored(factory, attribute, '<b>Fish</b> & chips')).to eq 'Fish & chips'
  end
end
