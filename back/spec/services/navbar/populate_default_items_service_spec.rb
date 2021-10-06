require 'rails_helper'

describe Navbar::PopulateDefaultItemsService do
  let(:service) { described_class.new }

  let!(:information_page) { create(:page, slug: 'information', navbar_item: nil) }
  let!(:faq_page) { create(:page, slug: 'faq', navbar_item: nil) }

  it "populates navbar items with pages" do
    expect { service.call }
      .to change { NavbarItem.count }.from(0).to(7)
      .and change { Page.count }.from(2).to(7)

    home_item = NavbarItem.find_by!(type: 'home')
    expect(home_item).to have_attributes(
      type: "home",
      visible: true,
      ordering: 0,
      title_multiloc: include("en" => "Home"),
    )
    expect(home_item.page).to have_attributes(
      title_multiloc: include("en" => "Home"),
      publication_status: 'published',
      body_multiloc: {},
      slug: nil,
      project: nil,
    )

    projects_item = NavbarItem.find_by!(type: 'projects')
    expect(projects_item).to have_attributes(
      type: "projects",
      visible: true,
      ordering: 1,
      title_multiloc: include("en" => "Projects"),
    )
    expect(projects_item.page).to have_attributes(
      title_multiloc: include("en" => "Projects"),
      publication_status: 'published',
      body_multiloc: {},
      slug: nil,
      project: nil,
    )

    all_input_item = NavbarItem.find_by!(type: 'all_input')
    expect(all_input_item).to have_attributes(
      type: "all_input",
      visible: true,
      ordering: 2,
      title_multiloc: include("en" => "All input"),
    )
    expect(all_input_item.page).to have_attributes(
      title_multiloc: include("en" => "All input"),
      publication_status: 'published',
      body_multiloc: {},
      slug: nil,
      project: nil,
    )

    proposals_item = NavbarItem.find_by!(type: 'proposals')
    expect(proposals_item).to have_attributes(
      type: "proposals",
      visible: true,
      ordering: 3,
      title_multiloc: include("en" => "Proposals"),
    )
    expect(proposals_item.page).to have_attributes(
      title_multiloc: include("en" => "Proposals"),
      publication_status: 'published',
      body_multiloc: {},
      slug: nil,
      project: nil,
    )

    events_item = NavbarItem.find_by!(type: 'events')
    expect(events_item).to have_attributes(
      type: "events",
      visible: true,
      ordering: 4,
      title_multiloc: include("en" => "Events"),
    )
    expect(events_item.page).to have_attributes(
      title_multiloc: include("en" => "Events"),
      publication_status: 'published',
      body_multiloc: {},
      slug: nil,
      project: nil,
    )

    expect(information_page.reload.navbar_item).to have_attributes(
      type: "custom",
      visible: true,
      ordering: 5,
      title_multiloc: include("en" => "About"),
    )

    expect(faq_page.reload.navbar_item).to have_attributes(
      type: "custom",
      visible: true,
      ordering: 6,
      title_multiloc: include("en" => "FAQ"),
    )
  end

  context "when there are not only default pages" do
    let!(:extra_page_1) do
      create(
        :page,
        slug: 'extra-page-1',
        title_multiloc: {
          "en" => "EN Short title",
          "be" => "BE Short title",
        },
        navbar_item: nil
      )
    end
    let!(:extra_page_2) do
      create(
        :page,
        slug: 'extra-page-2',
        title_multiloc: {
          "en" => "EN very long page 2 Title",
          "be" => "BE very long page 2 Title",
        },
        navbar_item: nil
      )
    end

    it "creates navbar items for those pages" do
      expect { service.call }
        .to change { NavbarItem.count}.from(0).to(9)
        .and change { Page.count }.from(4).to(9)

      expect(extra_page_1.reload.navbar_item).to have_attributes(
        type: 'custom',
        visible: false,
        ordering: 0,
        title_multiloc: {
          "en" => "EN Short title",
          "be" => "BE Short title",
        }
      )
      expect(extra_page_2.reload.navbar_item).to have_attributes(
        type: 'custom',
        visible: false,
        ordering: 1,
        title_multiloc: {
          "en" => "EN very long page...",
          "be" => "BE very long page...",
        }
      )
    end
  end

  context "when there are exception pages" do
    let!(:terms_and_conditions) { create :page, slug: 'terms-and-conditions', navbar_item: nil }
    let!(:privacy_policy) { create :page, slug: 'privacy-policy', navbar_item: nil }
    let!(:accessibility_statement) { create :page, slug: 'accessibility-statement', navbar_item: nil }
    let!(:cookie_policy) { create :page, slug: 'cookie-policy', navbar_item: nil }

    it "doesn't add navbar items to those pages" do
      expect { service.call }.to change { NavbarItem.count }.from(0).to(7)

      expect(terms_and_conditions.reload.navbar_item).to be_nil
      expect(privacy_policy.reload.navbar_item).to be_nil
      expect(accessibility_statement.reload.navbar_item).to be_nil
      expect(cookie_policy.reload.navbar_item).to be_nil
    end
  end
end
