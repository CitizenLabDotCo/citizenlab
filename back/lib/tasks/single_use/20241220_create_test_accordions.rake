# frozen_string_literal: true

namespace :single_use do
  desc 'Create test accordions to demonstrate migration'
  task create_test_accordions: :environment do
    puts "Creating test accordions..."

    # Process all tenants
    Tenant.all.each do |tenant|
      puts "\nProcessing tenant: #{tenant.host}"
      create_test_accordions_for_tenant(tenant)
    end

    puts "\nTest accordions created!"
  end

  private

  def create_test_accordions_for_tenant(tenant)
    tenant.switch do
      # Create test homepage layout with accordions
      create_test_homepage_layout

      # Create test project description layout with accordions
      create_test_project_description_layout
    end
  end

  def create_test_homepage_layout
    # Check if test layout already exists
    existing_layout = ContentBuilder::Layout.find_by(code: 'test_homepage_with_accordions')
    if existing_layout
      puts "  Test homepage layout already exists, skipping..."
      return
    end

    # Create test craftjs JSON with accordions
    craftjs_json = {
      "ROOT" => {
        "type" => "div",
        "isCanvas" => true,
        "props" => { "id" => "e2e-content-builder-frame" },
        "displayName" => "div",
        "custom" => {},
        "hidden" => false,
        "nodes" => ["TEST_ACCORDION_1", "TEST_ACCORDION_2", "TEST_ACCORDION_3"],
        "linkedNodes" => {}
      },
      "TEST_ACCORDION_1" => {
        "type" => { "resolvedName" => "AccordionMultiloc" },
        "isCanvas" => false,
        "props" => {
          "title" => { "en" => "Test Accordion with Text Content" },
          "text" => { "en" => "This is test content that will be migrated to a TextMultiloc component." },
          "openByDefault" => true
        },
        "displayName" => "AccordionMultiloc",
        "custom" => {
          "title" => {
            "id" => "app.containers.admin.ContentBuilder.accordionMultiloc",
            "defaultMessage" => "Accordion"
          }
        },
        "parent" => "ROOT",
        "hidden" => false,
        "nodes" => [],
        "linkedNodes" => {}
      },
      "TEST_ACCORDION_2" => {
        "type" => { "resolvedName" => "AccordionMultiloc" },
        "isCanvas" => false,
        "props" => {
          "title" => { "en" => "Empty Accordion" },
          "text" => { "en" => "" },
          "openByDefault" => false
        },
        "displayName" => "AccordionMultiloc",
        "custom" => {
          "title" => {
            "id" => "app.containers.admin.ContentBuilder.accordionMultiloc",
            "defaultMessage" => "Accordion"
          }
        },
        "parent" => "ROOT",
        "hidden" => false,
        "nodes" => [],
        "linkedNodes" => {}
      },
      "TEST_ACCORDION_3" => {
        "type" => { "resolvedName" => "AccordionMultiloc" },
        "isCanvas" => false,
        "props" => {
          "title" => { "en" => "Another Test Accordion" },
          "text" => { "en" => "This accordion has some content that should be preserved during migration." },
          "openByDefault" => false
        },
        "displayName" => "AccordionMultiloc",
        "custom" => {
          "title" => {
            "id" => "app.containers.admin.ContentBuilder.accordionMultiloc",
            "defaultMessage" => "Accordion"
          }
        },
        "parent" => "ROOT",
        "hidden" => false,
        "nodes" => [],
        "linkedNodes" => {}
      }
    }

    # Create the layout
    layout = ContentBuilder::Layout.create!(
      code: 'test_homepage_with_accordions',
      craftjs_json: craftjs_json
    )

    puts "  Created test homepage layout with 3 accordions"
  end

  def create_test_project_description_layout
    # Check if test layout already exists
    existing_layout = ContentBuilder::Layout.find_by(code: 'test_project_description_with_accordions')
    if existing_layout
      puts "  Test project description layout already exists, skipping..."
      return
    end

    # Create test craftjs JSON with accordions
    craftjs_json = {
      "ROOT" => {
        "type" => "div",
        "isCanvas" => true,
        "props" => { "id" => "e2e-content-builder-frame" },
        "displayName" => "div",
        "custom" => {},
        "hidden" => false,
        "nodes" => ["TEST_PROJECT_ACCORDION_1"],
        "linkedNodes" => {}
      },
      "TEST_PROJECT_ACCORDION_1" => {
        "type" => { "resolvedName" => "AccordionMultiloc" },
        "isCanvas" => false,
        "props" => {
          "title" => { "en" => "Project Description Accordion" },
          "text" => { "en" => "This accordion contains project description content that will be migrated." },
          "openByDefault" => true
        },
        "displayName" => "AccordionMultiloc",
        "custom" => {
          "title" => {
            "id" => "app.containers.admin.ContentBuilder.accordionMultiloc",
            "defaultMessage" => "Accordion"
          }
        },
        "parent" => "ROOT",
        "hidden" => false,
        "nodes" => [],
        "linkedNodes" => {}
      }
    }

    # Create the layout
    layout = ContentBuilder::Layout.create!(
      code: 'test_project_description_with_accordions',
      craftjs_json: craftjs_json
    )

    puts "  Created test project description layout with 1 accordion"
  end
end
