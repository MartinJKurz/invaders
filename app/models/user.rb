# == Schema Information
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class User < ActiveRecord::Base
  #before_destroy :finish_session

  has_many :scores, :dependent => :destroy #, :order => "score asc"
  has_many :articles, :dependent => :destroy


  attr_accessible :name, :password, :password_confirmation, :sound, :volume

  attr_accessor :password
  before_save :encrypt_password

  validates_confirmation_of :password
  validates_presence_of :password, :on => :create
  
  validates :volume,:presence   => true,
   				:numericality => true
					
  validates :name,  :presence   => true,
                    :length     => { :maximum => 15 },
                    :uniqueness => { :case_sensitive => false }

  def self.authenticate(name, password)
    user = find_by_name(name)
    if user && user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
      user
    else
      nil
    end
  end


  def encrypt_password
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
    end
  end

  def add_score(game_id, s)

    lsl = APP_CONFIG['low_score']
    if !lsl
        lsl = 1000
    end
    if s < lsl
        return "Score not added, below limit of " + lsl.to_s
    end

	limit = APP_CONFIG['scores_per_user']
    if !limit
        limit = 3
    end

    res = ""

    numScores = self.scores.length
    if numScores >= limit
      minScore = self.scores.minimum('score')
      if s < minScore
        return "Score not added, min is " + minScore.to_s
      end
      
      res += "Removed old score. "
      
      ms = self.scores.where('score = (?)', minScore.to_s).first
      ms.destroy
    end
    
    score = Score.new
    score.game_id = game_id
    score.user_id = self.id
    score.score = s
    score.save

    self.scores << score

    res += "Added new Score"

    self.save
    res
  end
  
  def testing
    self.name
  end

end

