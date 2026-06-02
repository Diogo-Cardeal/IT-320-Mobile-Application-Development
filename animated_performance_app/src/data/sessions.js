const sessionTypes = [
  'Reading Sprint',
  'Code Practice',
  'Design Review',
  'Debug Session',
  'Study Block',
  'Flashcard Run',
  'Research Lap',
  'Writing Pass',
];

export const completedSessions = Array.from({ length: 80 }, (_, index) => {
  const sessionNumber = index + 1;
  const minutes = 10 + ((index % 6) * 5);
  const score = 70 + ((index * 7) % 29);

  return {
    id: `session-${sessionNumber}`,
    label: `${sessionTypes[index % sessionTypes.length]} ${sessionNumber}`,
    duration: `${minutes} min`,
    focusScore: `${score}%`,
    completedAt: `Completed ${sessionNumber} sessions ago`,
  };
});
