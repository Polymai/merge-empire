import { Award, CheckCircle2, CircleDollarSign } from "lucide-react";
import type { GameState } from "../types/game";
import { dispatchGame } from "../state/gameStore";
import { achievementSummary } from "../game/gameReducer";
import { formatNumber } from "../game/economy";
import { isMissionComplete, missionProgress, MISSIONS } from "../game/missions";

type MissionPanelProps = {
  game: GameState;
};

export function MissionPanel({ game }: MissionPanelProps) {
  return (
    <section className="glass-panel" aria-labelledby="missions-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Targets</p>
          <h2 id="missions-title">Missions and milestones</h2>
        </div>
        <Award aria-hidden="true" className="panel-icon" />
      </div>

      <div className="mission-list">
        {MISSIONS.map((mission) => {
          const progress = missionProgress(game, mission);
          const complete = isMissionComplete(game, mission);
          const claimed = game.claimedMissionIds.includes(mission.id);
          return (
            <article key={mission.id} className="mission-row">
              <div>
                <span className="mission-kind">{mission.kind}</span>
                <h3>{mission.title}</h3>
                <progress value={Math.min(progress, mission.target)} max={mission.target} />
                <p>
                  {formatNumber(Math.min(progress, mission.target))} / {formatNumber(mission.target)}
                </p>
              </div>
              <button
                type="button"
                className={claimed ? "claim-button is-claimed" : "claim-button"}
                disabled={!complete || claimed}
                onClick={() => dispatchGame({ type: "claimMission", missionId: mission.id })}
              >
                {claimed ? <CheckCircle2 aria-hidden="true" /> : <CircleDollarSign aria-hidden="true" />}
                {claimed ? "Claimed" : `${formatNumber(mission.rewardCoins)}`}
              </button>
            </article>
          );
        })}
      </div>

      <div className="achievement-grid">
        {achievementSummary(game).map((achievement) => (
          <article key={achievement.id} className={achievement.unlocked ? "achievement is-unlocked" : "achievement"}>
            <Award aria-hidden="true" />
            <div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
