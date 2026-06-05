// Bible verses organized by topic
export const BIBLE_VERSES = {
  love: [
    { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", reference: "1 Corinthians 13:4" },
    { text: "Above all, love each other deeply, because love covers over a multitude of sins.", reference: "1 Peter 4:8" },
    { text: "And now these three remain: faith, hope and love. But the greatest of these is love.", reference: "1 Corinthians 13:13" },
    { text: "We love because he first loved us.", reference: "1 John 4:19" },
    { text: "Dear friends, let us love one another, for love comes from God.", reference: "1 John 4:7" },
  ],
  hope: [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
    { text: "May the God of hope fill you with all joy and peace as you trust in him.", reference: "Romans 15:13" },
    { text: "But those who hope in the Lord will renew their strength.", reference: "Isaiah 40:31" },
    { text: "Hope does not put us to shame, because God's love has been poured out into our hearts.", reference: "Romans 5:5" },
    { text: "We wait in hope for the Lord; he is our help and our shield.", reference: "Psalm 33:20" },
  ],
  faith: [
    { text: "Now faith is confidence in what we hope for and assurance about what we do not see.", reference: "Hebrews 11:1" },
    { text: "For we live by faith, not by sight.", reference: "2 Corinthians 5:7" },
    { text: "And without faith it is impossible to please God.", reference: "Hebrews 11:6" },
    { text: "The righteous will live by faith.", reference: "Romans 1:17" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
  ],
  wisdom: [
    { text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.", reference: "Proverbs 9:10" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault.", reference: "James 1:5" },
    { text: "The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.", reference: "Proverbs 4:7" },
    { text: "Wisdom is a shelter as money is a shelter, but the advantage of knowledge is this: Wisdom preserves those who have it.", reference: "Ecclesiastes 7:12" },
  ],
  gratitude: [
    { text: "Give thanks to the Lord, for he is good; his love endures forever.", reference: "Psalm 107:1" },
    { text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.", reference: "1 Thessalonians 5:18" },
    { text: "Enter his gates with thanksgiving and his courts with praise.", reference: "Psalm 100:4" },
    { text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.", reference: "Colossians 3:15" },
    { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
  ],
  strength: [
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
    { text: "My grace is sufficient for you, for my power is made perfect in weakness.", reference: "2 Corinthians 12:9" },
    { text: "The Lord is my strength and my shield; my heart trusts in him, and he helps me.", reference: "Psalm 28:7" },
    { text: "Finally, be strong in the Lord and in his mighty power.", reference: "Ephesians 6:10" },
    { text: "But the Lord is faithful, and he will strengthen you and protect you from the evil one.", reference: "2 Thessalonians 3:3" },
  ],
  peace: [
    { text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", reference: "John 14:27" },
    { text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:7" },
    { text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", reference: "Isaiah 26:3" },
    { text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace.", reference: "Colossians 3:15" },
    { text: "Turn from evil and do good; seek peace and pursue it.", reference: "Psalm 34:14" },
  ],
  joy: [
    { text: "Rejoice in the Lord always. I will say it again: Rejoice!", reference: "Philippians 4:4" },
    { text: "The joy of the Lord is your strength.", reference: "Nehemiah 8:10" },
    { text: "May the God of hope fill you with all joy and peace.", reference: "Romans 15:13" },
    { text: "These things I have spoken to you, that my joy may be in you, and that your joy may be full.", reference: "John 15:11" },
    { text: "Shout for joy to the Lord, all the earth.", reference: "Psalm 100:1" },
  ],
};

export const TOPIC_LABELS = {
  love: "Love",
  hope: "Hope",
  faith: "Faith",
  wisdom: "Wisdom",
  gratitude: "Gratitude",
  strength: "Strength",
  peace: "Peace",
  joy: "Joy",
};

export function getRandomVerse(topic = 'all') {
  let verses = [];
  
  if (topic === 'all') {
    // Get all verses from all topics
    Object.values(BIBLE_VERSES).forEach(topicVerses => {
      verses = verses.concat(topicVerses);
    });
  } else {
    verses = BIBLE_VERSES[topic] || BIBLE_VERSES.love;
  }
  
  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex];
}
