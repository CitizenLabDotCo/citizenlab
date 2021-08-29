require 'rails_helper'

describe CreatePageService do
  let(:service) { described_class.new(page, user) }
  let(:user) { create(:user) }
  let(:page) do
    Page.new(
      slug: 'example',
      publication_status: 'published',
      title_multiloc: page_title_multiloc,
      body_multiloc: page_body_multiloc,
      navbar_item_attributes: {
        title_multiloc: navbar_item_title_multiloc
      }
    )
  end
  let(:page_title_multiloc) do
    {
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }
  end
  let(:page_body_multiloc) do
    {
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }
  end
  let(:navbar_item_title_multiloc) do
    {
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }
  end

  # reserved pages should exist for each tenant
  let!(:home_page) { create(:page, :home) }
  let!(:projects_page) { create(:page, :projects) }

  it 'creates a page' do
    expect { service.call }
      .to change { Page.count }.from(2).to(3)
      .and change { NavbarItem.count }.from(2).to(3)
      .and have_enqueued_job(LogActivityJob)

    page = Page.find_by(slug: 'example')
    expect(page).to be_present
    expect(page.publication_status).to eq('published')
    expect(page.title_multiloc).to eq(page_title_multiloc)
    expect(page.body_multiloc).to eq(page_body_multiloc)

    expect(page.navbar_item.type).to eq('custom')
    expect(page.navbar_item).to be_visible
    expect(page.navbar_item.position).to eq(2)
    expect(page.navbar_item.title_multiloc).to eq(navbar_item_title_multiloc)
  end

  context "when there are 3 pages" do
    let!(:proposals_page) { create(:page, navbar_item: build(:navbar_item, type: 'proposals', visible: true, position: 2)) }

    it 'puts the created page to the fourth position' do
      service.call

      navbar_item = NavbarItem.find_by!(type: 'custom')
      expect(navbar_item.position).to eq(3)
    end

    context "when the limit for max visible items is reached" do
      let!(:hidden_page) { create(:page, navbar_item: build(:navbar_item, visible: false, position: 0)) }

      before do
        stub_const("NavbarItem::MAX_VISIBLE_ITEMS", 3)
      end

      it 'hides the last visible item' do
        service.call

        page = Page.find_by!(slug: 'example')
        expect(page.navbar_item).to be_visible
        expect(page.navbar_item.position).to eq(2)

        proposals_item = NavbarItem.find_by!(type: 'proposals')
        expect(proposals_item).not_to be_visible
        expect(proposals_item.position).to eq(1)
      end
    end
  end
end
