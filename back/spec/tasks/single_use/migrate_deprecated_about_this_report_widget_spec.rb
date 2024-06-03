# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
# RSpec.describe 'single_use:migrate_deprecated_about_this_report_widget' do
#   # rubocop:disable RSpec/BeforeAfterAll
#   before(:all) do
#     task_path = 'tasks/single_use/20240527_migrate_deprecated_about_this_report_widget'
#     Rake.application.rake_require(task_path)
#     Rake::Task.define_task(:environment)
#   end
#   # rubocop:enable RSpec/BeforeAfterAll
#
#   before do
#     Rake::Task['single_use:migrate_deprecated_about_this_report_widget'].reenable
#   end
#
#   def load_fixture(file_name)
#     Pathname.new(File.dirname(__FILE__)).join('fixtures', file_name).read
#   end
#
#   def load_json(file_name)
#     JSON.parse(load_fixture(file_name))
#   end
#
#   let(:json_before) { load_json('about-this-report.before.report-layout.json') }
#   let!(:report_layout) { create(:report_layout, craftjs_json: json_before) }
#
#   context 'when the tenant has a logo' do
#     before do
#       AppConfiguration.instance.update!(logo: Rails.root.join('spec/fixtures/logo.png').open)
#     end
#
#     it "converts the 'AboutReportWidget' into an 'ImageMultiloc' and two 'TextMultiloc' nodes" do
#       Rake::Task['single_use:migrate_deprecated_about_this_report_widget'].invoke
#
#       craftjs_json = report_layout.reload.craftjs_json
#       expect(craftjs_json.size).to eq(4) # ROOT + the 3 nodes replacing the AboutReportWidget
#
#       about_nodes = craftjs_json.values.select do |node|
#         node['type']['resolvedName'] == 'AboutReportWidget'
#       end
#       expect(about_nodes).to be_empty
#
#       root_children = craftjs_json['ROOT']['nodes']
#
#       expect(craftjs_json[root_children[0]]).to match(
#         'type' => { 'resolvedName' => 'ImageMultiloc' },
#         'nodes' => [],
#         'props' => {
#           'image' => { 'dataCode' => be_a(String) },
#           'stretch' => false
#         },
#         'custom' => {},
#         'hidden' => false,
#         'parent' => 'ROOT',
#         'isCanvas' => false,
#         'displayName' => 'Image',
#         'linkedNodes' => {}
#       )
#
#       expect(craftjs_json[root_children[1]]).to match(
#         'type' => { 'resolvedName' => 'TextMultiloc' },
#         'nodes' => [],
#         'props' => {
#           'text' => {
#             'en' => '<h2>marker-about-title</h2>',
#             'fr-BE' => '<h2>about-this-report</h2>',
#             'nl-BE' => '<h2>about-this-report</h2>'
#           }
#         },
#         'custom' => {},
#         'hidden' => false,
#         'parent' => 'ROOT',
#         'isCanvas' => false,
#         'displayName' => 'TextMultiloc',
#         'linkedNodes' => {}
#       )
#
#       expect(craftjs_json[root_children[2]]).to match(
#         'type' => { 'resolvedName' => 'TextMultiloc' },
#         'nodes' => [],
#         'props' => {
#           'text' => {
#             'en' => '<p>marker-about-text</p>',
#             'fr-BE' => '<p>marker-about-text</p>',
#             'nl-BE' => '<p>marker-about-text</p>'
#           }
#         },
#         'custom' => {},
#         'hidden' => false,
#         'parent' => 'ROOT',
#         'isCanvas' => false,
#         'displayName' => 'TextMultiloc',
#         'linkedNodes' => {}
#       )
#     end
#   end
#
#   context 'when the tenant has no logo' do
#     it "converts the 'AboutReportWidget' into two 'TextMultiloc' nodes" do
#       Rake::Task['single_use:migrate_deprecated_about_this_report_widget'].invoke
#
#       craftjs_json = report_layout.reload.craftjs_json
#       expect(craftjs_json.size).to eq(3)
#
#       nb_text_multiloc_nodes = craftjs_json.count do |_, node|
#         node['type']['resolvedName'] == 'TextMultiloc'
#       end
#
#       expect(nb_text_multiloc_nodes).to eq(2)
#     end
#   end
#
#   it 'creates a backup of the layout' do
#     expect do
#       Rake::Task['single_use:migrate_deprecated_about_this_report_widget'].invoke
#     end.to change(ContentBuilder::Layout, :count).by(1)
#
#     backup = ContentBuilder::Layout.find_by!(code: "backup/#{report_layout.code}/#{report_layout.id}")
#     expect(backup.craftjs_json).to eq(json_before)
#     expect(backup.content_buildable).to be_nil
#   end
# end
# # rubocop:enable RSpec/DescribeClass
