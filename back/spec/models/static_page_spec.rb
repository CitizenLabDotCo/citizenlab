# frozen_string_literal: true

require 'rails_helper'

RSpec.describe StaticPage do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:static_page)).to be_valid
    end
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title_multiloc) }

    it 'validates presence of slug' do
      page = build(:static_page)
      allow(page).to receive(:generate_slug) # Stub to do nothing
      page.slug = nil
      expect(page).to be_invalid
      expect(page.errors[:slug]).to include("can't be blank")
    end

    context 'when code is not \'custom\'' do
      subject { described_class.new(code: 'faq') }

      it { is_expected.to validate_uniqueness_of(:code) }
      it { is_expected.to validate_inclusion_of(:code).in_array(%w[about terms-and-conditions privacy-policy faq custom]) }
    end

    context 'when code is \'custom\'' do
      subject { described_class.new(code: 'custom') }

      it { is_expected.not_to validate_uniqueness_of(:code) }
      it { is_expected.to validate_inclusion_of(:code).in_array(%w[about terms-and-conditions privacy-policy faq custom]) }
    end

    context 'when banner_cta_button_type is set to \'customized_button\'' do
      subject { described_class.new(banner_cta_button_type: 'customized_button') }

      it { is_expected.to validate_presence_of(:banner_cta_button_url) }
      it { is_expected.to validate_presence_of(:banner_cta_button_multiloc) }
    end

    context 'when projects_enabled is set to true' do
      subject { described_class.new(projects_enabled: true) }

      it { is_expected.to validate_presence_of(:projects_filter_type) }
    end

    context 'when projects_filter_type is areas' do
      it 'cannot have zero areas' do
        valid = build(:static_page, projects_filter_type: 'areas', areas: []).valid?
        expect(valid).to be(false)
      end

      it 'cannot have two areas' do
        valid = build(:static_page, projects_filter_type: 'areas', areas: [build(:area), build(:area)]).valid?
        expect(valid).to be(false)
      end

      it 'can have one area' do
        valid = build(:static_page, projects_filter_type: 'areas', areas: [build(:area)]).valid?
        expect(valid).to be(true)
      end
    end

    describe '#projects_filter_type' do
      it 'is not valid with a bad projects filter type' do
        expect { build(:static_page, projects_filter_type: 'not_a_valid_enum_value') }
          .to raise_error(ArgumentError)
          .with_message(/is not a valid projects_filter_type/)
      end
    end
  end

  describe '#filter_projects' do
    it 'filters projects by topics' do
      topic = create(:topic)
      project = create(:project, topics: [topic])
      project2 = create(:project, topics: [])
      page = create(:static_page, topics: [topic], projects_filter_type: 'topics')

      expect(page.filter_projects(Project.all)).to include(project)
      expect(page.filter_projects(Project.all)).not_to include(project2)
    end

    it 'filters projects by areas' do
      area = create(:area)
      project = create(:project, areas: [area])
      project2 = create(:project, areas: [])
      page = create(:static_page, areas: [area], projects_filter_type: 'areas')

      expect(page.filter_projects(Project.all)).to include(project)
      expect(page.filter_projects(Project.all)).not_to include(project2)
    end
  end

  describe 'generate_slug' do
    let(:static_page) { build(:static_page, slug: nil) }

    it 'generates a slug based on the first non-empty locale' do
      static_page.update!(title_multiloc: { 'fr-BE' => 'titre', 'en' => 'title' })
      expect(static_page.slug).to eq 'titre'
    end
  end

  describe 'before destroy' do
    subject(:static_page) { build(:static_page) }

    it "allows destruction of static page with :code 'custom'" do
      expect { static_page.destroy! }.not_to raise_error
    end

    it "allows destruction of static page with :code 'cookie-policy'" do
      static_page.update!(code: 'cookie-policy', slug: 'cookie-policy')
      expect { static_page.destroy! }.not_to raise_error
    end

    it 'prevents destruction of static page with any other :code' do
      static_page.update!(code: 'faq', slug: 'faq')
      expect { static_page.destroy! }.to raise_error ActiveRecord::RecordNotDestroyed
    end
  end

  describe 'before validate' do
    let(:topic) { create(:topic) }

    it 'destroys unused associations' do
      static_page = create(:static_page, projects_filter_type: 'topics', code: 'faq', topics: [topic])
      expect(static_page.topics).to be_present
      static_page.update!(projects_filter_type: 'areas', areas: [build(:area)])
      expect(static_page.topics).to be_empty
      expect(topic).to be_persisted
    end

    it 'does not destroy association if validation failed' do
      static_page = create(:static_page, projects_filter_type: 'topics', code: 'faq', topics: [topic])
      expect(static_page.topics).to be_present
      updated = static_page.update(projects_filter_type: 'areas', areas: [])

      expect(updated).to be(false)
      expect(static_page.reload.topics).to be_present
    end

    it 'saves only association from projects_filter_type' do
      area = create(:area)

      static_page = create(:static_page, projects_filter_type: 'topics', code: 'faq', topics: [topic], areas: [area])
      expect(static_page.reload.topics).to be_present
      expect(static_page.reload.areas).to be_empty

      static_page.update(projects_filter_type: 'no_filter', topics: [topic], areas: [area])
      expect(static_page.reload.topics).to be_empty
      expect(static_page.reload.areas).to be_empty
    end
  end

  describe 'image uploads' do
    subject(:static_page) { build(:static_page) }

    it 'stores a header background image' do
      static_page.header_bg = File.open(Rails.root.join('spec/fixtures/header.jpg'))
      static_page.save!
      expect(static_page.header_bg.url).to be_present
    end
  end
end
