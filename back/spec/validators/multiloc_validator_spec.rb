# frozen_string_literal: true

require 'rails_helper'

class Validatable
  include ActiveModel::Validations
  validates :multiloc_field, multiloc: { presence: true }
  attr_accessor :multiloc_field
end

class Validatable2
  include ActiveModel::Validations
  validates :multiloc_field, multiloc: { presence: false }
  attr_accessor :multiloc_field
end

class Validatable3
  include ActiveModel::Validations
  validates :multiloc_field, multiloc: { html: true }
  attr_accessor :multiloc_field
end

class Validatable4
  include ActiveModel::Validations
  validates :multiloc_field, multiloc: { value_type: Hash }
  attr_accessor :multiloc_field
end

describe MultilocValidator do
  let(:presence_subject) { Validatable.new }
  let(:nonpresence_subject) { Validatable2.new }

  context 'without nil values' do
    it 'is valid' do
      nonpresence_subject.multiloc_field = { 'en' => 'somevalue', 'nl-BE' => '' }
      expect(nonpresence_subject).to be_valid
    end
  end

  context 'with nil values for some locales' do
    it 'is invalid' do
      nonpresence_subject.multiloc_field = { 'en' => 'somevalue', 'fr-BE' => nil }
      expect(nonpresence_subject).to be_invalid

      nonpresence_subject.multiloc_field = { 'en' => 'somevalue', 'fr-BE' => false, 'nl-BE' => '' }
      expect(nonpresence_subject).to be_invalid
    end
  end

  context 'with one locale value' do
    it 'is valid' do
      presence_subject.multiloc_field = { 'en' => 'somevalue' }
      expect(presence_subject).to be_valid
    end
  end

  context 'with an empty locale value' do
    it 'is invalid when presence: true option is set' do
      presence_subject.multiloc_field = {}
      expect(presence_subject).to be_invalid
    end

    it 'is valid when presence: false option is set' do
      nonpresence_subject.multiloc_field = {}
      expect(nonpresence_subject).to be_valid
    end
  end

  context 'with a nil locale value' do
    it 'is invalid when presence: true option is set' do
      expect(presence_subject).to be_invalid
    end

    it 'is valid when presence: false option is set' do
      expect(nonpresence_subject).to be_valid
    end
  end

  context 'with unsupported languages' do
    it 'is invalid' do
      presence_subject.multiloc_field = { 'smalltalk' => 'Hey how are you?' }
      expect(presence_subject).to be_invalid
    end
  end

  context 'with string values' do
    it 'is invalid when some values are not strings' do
      nonpresence_subject.multiloc_field = { 'en' => 'My value', 'nl-BE' => false }
      expect(nonpresence_subject).to be_invalid
    end

    it 'is invalid when some values are nil' do
      nonpresence_subject.multiloc_field = { 'en' => 'My value', 'nl-BE' => nil }
      expect(nonpresence_subject).to be_invalid
    end

    it 'is valid when all values are strings' do
      nonpresence_subject.multiloc_field = { 'en' => 'My value', 'nl-BE' => '' }
      expect(nonpresence_subject).to be_valid
    end
  end

  context 'with hash values' do
    let(:hashed_multiloc_subject) { Validatable4.new }

    it 'is invalid when some values are not hashes' do
      hashed_multiloc_subject.multiloc_field = { 'en' => { my_value: 53 }, 'nl-BE' => 'test' }
      expect(hashed_multiloc_subject).to be_invalid
    end

    it 'is invalid when some values are nil' do
      hashed_multiloc_subject.multiloc_field = { 'en' => { my_value: 53 }, 'fr-BE' => nil }
      expect(hashed_multiloc_subject).to be_invalid
    end

    it 'is valid when all values are strings' do
      hashed_multiloc_subject.multiloc_field = { 'en' => { my_value: 53 }, 'de-DE' => {} }
      expect(hashed_multiloc_subject).to be_valid
    end
  end

  context 'with html' do
    it 'is valid when valid html' do
      vald = Validatable3.new
      vald.multiloc_field = { 'en' => '<strong>Health &amp; Wellness</strong>' }
      expect(vald).to be_valid
    end

    it 'is invalid when invalid html' do
      vald = Validatable3.new
      vald.multiloc_field = { 'en' => '<strong>Health & Wellness</strong>' }
      expect(vald).to be_invalid
    end

    it 'is valid when plain text' do
      vald = Validatable3.new
      vald.multiloc_field = { 'en' => 'Health & Wellness' }
      expect(vald).to be_valid
    end
  end
end
