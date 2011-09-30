class RemoveDateFromScore < ActiveRecord::Migration
  def up
    remove_column :scores, :date
  end

  def down
    add_column :scores, :date, :datetime
  end
end
