import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trophy, Award, Star, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from '../../lib/axios';
import './AchievementsPage.css';

const getIcon = (iconName) => {
  switch (iconName) {
    case 'badge':
      return <Award className="achievement-icon" />;
    case 'trophy':
      return <Trophy className="achievement-icon" />;
    case 'star':
      return <Star className="achievement-icon" />;
    case 'target':
      return <Target className="achievement-icon" />;
    default:
      return <Award className="achievement-icon" />;
  }
};

export const AchievementsPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await axios.get('/achievements');
      return response.data?.data || null;
    },
  });

  if (isLoading) {
    return (
      <div className="achievements-page">
        <div className="achievements-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="achievements-page">
        <div className="achievements-error">
          <p>Unable to load achievements right now. Please try again later.</p>
        </div>
      </div>
    );
  }

  const {
    totalPoints = 0,
    badgesEarned = 0,
    classRank,
    streakDays = 0,
    badges = [],
    leaderboard = [],
  } = data;

  return (
    <div className="achievements-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="achievements-header"
      >
        <div>
          <h1 className="achievements-title">Achievements</h1>
          <p className="achievements-subtitle">Track your progress and compete with peers</p>
        </div>
      </motion.div>

      <div className="achievements-stats">
        <Card className="achievement-stat-card">
          <CardContent className="achievement-stat-content">
            <Trophy className="achievement-stat-icon" />
            <div className="achievement-stat-info">
              <p className="achievement-stat-label">Total Points</p>
              <p className="achievement-stat-value">{totalPoints.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="achievement-stat-card">
          <CardContent className="achievement-stat-content">
            <Award className="achievement-stat-icon" />
            <div className="achievement-stat-info">
              <p className="achievement-stat-label">Badges Earned</p>
              <p className="achievement-stat-value">{badgesEarned}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="achievement-stat-card">
          <CardContent className="achievement-stat-content">
            <Star className="achievement-stat-icon" />
            <div className="achievement-stat-info">
              <p className="achievement-stat-label">Class Rank</p>
              <p className="achievement-stat-value">{classRank ? `#${classRank}` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="achievement-stat-card">
          <CardContent className="achievement-stat-content">
            <Target className="achievement-stat-icon" />
            <div className="achievement-stat-info">
              <p className="achievement-stat-label">Streak Days</p>
              <p className="achievement-stat-value">{streakDays}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="achievements-grid">
        <Card className="achievements-badges-card">
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="achievements-badges-list">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <div key={badge.id} className={`achievement-badge achievement-badge-${badge.color}`}>
                    <div className="achievement-badge-icon">
                      {getIcon(badge.icon)}
                    </div>
                    <div className="achievement-badge-info">
                      <h3 className="achievement-badge-name">{badge.name}</h3>
                      <p className="achievement-badge-description">{badge.description}</p>
                      {badge.progress === 100 ? (
                        <p className="achievement-badge-date">Earned on: {badge.earnedDate}</p>
                      ) : (
                        <div className="achievement-badge-progress">
                          <div className="achievement-progress-bar">
                            <div
                              className="achievement-progress-fill"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                          <p className="achievement-progress-text">{Math.round(badge.progress)}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="achievements-empty">You haven't unlocked any badges yet. Keep going!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="achievements-leaderboard-card">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="achievements-leaderboard">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''}`}
                  >
                    <div className="leaderboard-rank">
                      {entry.medal ? (
                        <span className={`leaderboard-medal leaderboard-medal-${entry.medal}`}>
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                        </span>
                      ) : (
                        <span className="leaderboard-rank-number">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="leaderboard-avatar">
                      {entry.initials}
                    </div>
                    <div className="leaderboard-info">
                      <p className="leaderboard-name">{entry.name}</p>
                      <p className="leaderboard-points">{entry.points.toLocaleString()} points</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="achievements-empty">No leaderboard data available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

