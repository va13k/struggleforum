const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

function formatRelativeTime(isoDate: string, now: number): string {
  const deltaSeconds = (new Date(isoDate).getTime() - now) / 1000;

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(deltaSeconds) >= secondsInUnit) {
      return formatter.format(Math.round(deltaSeconds / secondsInUnit), unit);
    }
  }

  return formatter.format(Math.round(deltaSeconds), "second");
}

export default function RelativeTime({ dateTime }: { dateTime: string }) {
  return (
    <time dateTime={dateTime} title={new Date(dateTime).toLocaleString()}>
      {formatRelativeTime(dateTime, Date.now())}
    </time>
  );
}
