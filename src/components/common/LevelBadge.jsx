export default function LevelBadge({ cls, label }) {
  return <span className={`level-badge ${cls}`}>{label}</span>;
}
