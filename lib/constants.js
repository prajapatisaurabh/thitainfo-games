// Shared constants for the typing game
// Used by both frontend and backend to ensure consistency

export const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  "Programming is the art of telling a computer what to do through a series of instructions. It requires logic, creativity, and problem-solving skills.",
  "Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, innovation continues to shape our future.",
  "Practice makes perfect. The more you type, the faster and more accurate you become. Consistency is key to improving your typing skills.",
  "Web development combines creativity with technical skills. Building websites requires knowledge of HTML, CSS, JavaScript, and various frameworks.",
  "The best way to learn programming is by doing. Start with simple projects and gradually work your way up to more complex applications.",
  "Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of heuristics.",
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "Innovation distinguishes between a leader and a follower. Think different and challenge the status quo.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
];

export const getRandomText = () => {
  return TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
};
