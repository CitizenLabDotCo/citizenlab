# frozen_string_literal: true

require_relative 'services/redundant_white_space_remover'

# Project pages got automatic spacing between widgets (TAN-8489). Spacers admins had
# inserted by hand to compensate for the old cramped layout now stack their own height
# on top of the automatic gap, roughly doubling the space around them. This removes the
# spacers the rhythm made redundant: every WhiteSpace in a `project_page` layout with a
# widget on both sides. Divider, large, leading and trailing spacers are kept and
# printed for review (see RedundantWhiteSpaceRemover).
#
# The report holds each layout's craftjs_json before and after, so any removal can be
# restored from it.
#
#     rake single_use:remove_redundant_white_space_widgets                     # dry run, all tenants
#     rake 'single_use:remove_redundant_white_space_widgets[execute]'          # write, all tenants
#     rake 'single_use:remove_redundant_white_space_widgets[execute,foo.com]'  # write, one tenant
namespace :single_use do
  desc "Remove WhiteSpace widgets made redundant by the project page vertical rhythm. Dry run unless passed 'execute'."
  task :remove_redundant_white_space_widgets, %i[execute host] => [:environment] do |_t, args|
    remover = Tasks::SingleUse::Services::RedundantWhiteSpaceRemover.new
    review_lines = []

    print_review = lambda do |_script|
      next if review_lines.empty?

      # rubocop:disable Rails/Output -- run by hand at a terminal, like TenantScript itself.
      puts "\n   📋 Kept spacers to review by hand:"
      review_lines.each { |line| puts "      #{line}" }
      # rubocop:enable Rails/Output
    end

    TenantScript.run(
      'remove_redundant_white_space_widgets',
      args: args,
      description: 'removing WhiteSpace widgets made redundant by the vertical rhythm',
      summary: print_review
    ) do |tenant, script|
      layouts = ContentBuilder::Layout
        .where(code: ContentBuilder::ProjectPageLayoutService::CODE)
        .with_widget_type(Tasks::SingleUse::Services::RedundantWhiteSpaceRemover::WHITE_SPACE)

      layouts.find_each do |layout|
        result = remover.call(layout.craftjs_json)
        context = {
          tenant: tenant.host,
          layout_id: layout.id,
          project_id: layout.content_buildable_id,
          enabled: layout.enabled
        }

        result.review.each do |item|
          review_lines << "#{tenant.host} project #{layout.content_buildable_id}: " \
                          "#{item[:reason]} #{item[:size]} spacer (node #{item[:id]})"
        end

        next if result.removed.empty?

        result.removed.each do |item|
          script.reporter.add_delete('WhiteSpace node', item[:id], context: context.merge(item.except(:id)))
        end
        script.reporter.add_change(layout.craftjs_json, result.json, context: context.merge(removed_count: result.removed.size))
        # update_column: sanitization/validation callbacks are for admin input, and must
        # not be able to block or alter a removal on legacy layouts.
        layout.update_column(:craftjs_json, result.json) if script.execute?
      end
    end
  end
end
