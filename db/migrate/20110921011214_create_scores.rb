class CreateScores < ActiveRecord::Migration
  def change
    create_table :scores do |t|
      t.integer :game
      t.integer :user
      t.integer :score
      t.datetime :date

      t.timestamps
    end
  end
end
