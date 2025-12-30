export function calculateMatchScore(interestsA: string[], interestsB: string[]) {
  const shared = interestsA.filter(i => interestsB.includes(i));
  return shared.length * 10; // each shared interest = +10 score
}
