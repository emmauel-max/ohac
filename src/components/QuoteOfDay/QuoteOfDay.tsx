import { useState } from "react";
import "./QuoteOfDay.css";

const QUOTES = [
  { text: "The more you sweat in peace, the less you bleed in war.", author: "Norman Schwarzkopf" },
  { text: "Discipline is the soul of an army. It makes small numbers formidable.", author: "George Washington" },
  { text: "Courage is not the absence of fear, but rather the judgment that something else is more important than fear.", author: "Ambrose Redmoon" },
  { text: "Lead me, follow me, or get out of my way.", author: "George S. Patton" },
  { text: "The object of war is not to die for your country, but to make the other side die for theirs.", author: "George S. Patton" },
  { text: "Service to others is the rent you pay for your room here on earth.", author: "Muhammad Ali" },
  { text: "A good soldier is someone who fights not because he hates those in front of him, but because he loves those behind him.", author: "G.K. Chesterton" },
  { text: "Excellence is not a skill, it is an attitude.", author: "Ralph Marston" },
  { text: "In military life, discipline is the beginning of wisdom.", author: "Sun Tzu" },
  { text: "Hard times make strong people. Strong people make easy times.", author: "Military Proverb" },
  { text: "The best weapon against an enemy is another enemy.", author: "Friedrich Nietzsche" },
  { text: "Arise, awake, and stop not until the goal is achieved.", author: "Swami Vivekananda" },
  { text: "Bravery is being the only one who knows you're afraid.", author: "Franklin P. Jones" },
  { text: "Do not pray for easy lives. Pray to be stronger men.", author: "John F. Kennedy" },
  { text: "It is not the size of the dog in the fight, it is the size of the fight in the dog.", author: "Mark Twain" },
];

function getDailyIndex() {
  const today = new Date().toISOString().slice(0, 10);
  return parseInt(today.replace(/-/g, ""), 10) % QUOTES.length;
}

export default function QuoteOfDay() {
  const [quoteIndex, setQuoteIndex] = useState<number>(() => getDailyIndex());
  const [fading, setFading] = useState(false);

  const quote = QUOTES[quoteIndex];

  const nextQuote = () => {
    setFading(true);
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setFading(false);
    }, 300);
  };

  return (
    <div className="qod-card">
      <div className="qod-header">
        <span className="qod-icon">💬</span>
        <span className="qod-label">Quote of the Day</span>
        <button className="qod-next-btn" onClick={nextQuote} title="Next quote" aria-label="Next quote">
          🔄
        </button>
      </div>
      <blockquote className={`qod-quote ${fading ? "qod-quote--fading" : ""}`}>
        <p className="qod-text">"{quote.text}"</p>
        <footer className="qod-author">— {quote.author}</footer>
      </blockquote>
    </div>
  );
}
