# frozen_string_literal: true

# Shared examples for a model attribute holding rich text sanitized on write.
#
# The sanitizing rules are specced in spec/services/sanitization_service_spec.rb; these examples
# only assert that the attribute is wired to them. They cover what holds whatever `features` the
# model allows - a script tag and an event handler never survive. Which tags a model keeps depends
# on its own allowlist, so assert that in the model's spec.
#
# Usage:
#   it_behaves_like 'a sanitized html_multiloc', factory: :space
#   it_behaves_like 'a sanitized html_multiloc', factory: :project_folder, attribute: :description_preview_multiloc
#
# @param factory [Symbol] A factory that accepts the attribute.
# @param attribute [Symbol] The multiloc attribute to check.
RSpec.shared_examples 'a sanitized html_multiloc' do |factory:, attribute: :description_multiloc|
  def sanitized(factory, attribute, html)
    create(factory, attribute => { 'en' => html }).public_send(attribute)['en']
  end

  it "strips a script tag from #{attribute}, leaving its text inert" do
    expect(sanitized(factory, attribute, '<p>Test</p><script>alert(1)</script>')).to eq '<p>Test</p>alert(1)'
  end

  it "strips an event handler attribute from #{attribute}" do
    expect(sanitized(factory, attribute, '<p onclick="alert(1)">Test</p>')).to eq '<p>Test</p>'
  end
end
