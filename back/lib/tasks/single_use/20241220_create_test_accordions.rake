# frozen_string_literal: true

namespace :single_use do
  desc 'Create test data with accordions to demonstrate migration'
  task create_test_accordions: :environment do
    puts 'Creating test accordions...'

    # Create a test project
    project = FactoryBot.create(:project, title_multiloc: { 'en' => 'Test Project for Accordion Migration' })

    # Create homepage layout with accordions
    homepage_layout = FactoryBot.create(:homepage_layout, project: project)

    # Sample accordion content
    accordion_titles = [
      { 'en' => 'What is CitizenLab?' },
      { 'en' => 'How to participate' },
      { 'en' => 'Frequently Asked Questions' },
      { 'en' => 'Contact Information' },
      { 'en' => 'Privacy Policy' }
    ]

    accordion_texts = [
      { 'en' => '<p>CitizenLab is a civic tech platform that enables governments and organizations to engage with their citizens through participatory democracy.</p>' },
      { 'en' => '<p>You can participate by voting on ideas, submitting proposals, and engaging in discussions with other community members.</p>' },
      { 'en' => '<p><strong>Q: How do I create an account?</strong><br>A: Click the sign-up button and follow the registration process.</p>' },
      { 'en' => '<p>For questions or support, please contact us at support@citizenlab.co</p>' },
      { 'en' => '<p>We take your privacy seriously. Read our full privacy policy to understand how we protect your data.</p>' }
    ]

    # Create accordions with different content
    accordion_titles.each_with_index do |title, index|
      accordion_node = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'props' => {
          'title' => title,
          'text' => accordion_texts[index],
          'openByDefault' => index == 0 # First accordion open by default
        },
        'nodes' => [],
        'custom' => {},
        'isCanvas' => false,
        'hidden' => false,
        'linkedNodes' => {}
      }

      # Add accordion to layout
      homepage_layout.craftjs_json['ROOT']['nodes'].push(accordion_node)
    end

    # Create project page layout with accordions
    project_page_layout = FactoryBot.create(:project_page_layout, project: project)

    # Add accordions to project page
    project_accordion_titles = [
      { 'en' => 'Project Timeline' },
      { 'en' => 'Budget Information' },
      { 'en' => 'Stakeholder Feedback' }
    ]

    project_accordion_texts = [
      { 'en' => '<p>Phase 1: Planning (Jan-Mar)<br>Phase 2: Implementation (Apr-Jun)<br>Phase 3: Evaluation (Jul-Sep)</p>' },
      { 'en' => '<p>Total budget: €50,000<br>Allocated for community engagement and platform development.</p>' },
      { 'en' => '<p>We have received valuable feedback from over 200 community members. Your input shapes our decisions.</p>' }
    ]

    project_accordion_titles.each_with_index do |title, index|
      accordion_node = {
        'type' => { 'resolvedName' => 'AccordionMultiloc' },
        'props' => {
          'title' => title,
          'text' => project_accordion_texts[index],
          'openByDefault' => false
        },
        'nodes' => [],
        'custom' => {},
        'isCanvas' => false,
        'hidden' => false,
        'linkedNodes' => {}
      }

      # Add accordion to project page layout
      project_page_layout.craftjs_json['ROOT']['nodes'].push(accordion_node)
    end

    # Save layouts
    homepage_layout.save!
    project_page_layout.save!

    puts "Created #{accordion_titles.length} accordions in homepage layout"
    puts "Created #{project_accordion_titles.length} accordions in project page layout"
    puts "Project ID: #{project.id}"
    puts 'Test data creation completed!'
  end
end
