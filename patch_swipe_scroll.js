import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// Update touch logic to also scroll the category into view
const newTouchLogic = `
  const scrollToCat = (cat) => {
    setActiveCategory(cat);
    setTimeout(() => {
      const el = document.getElementById('cat_btn_' + cat);
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
  };
  
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex < categories.length - 1) scrollToCat(categories[currentIndex + 1]);
    } else if (distance < -50) {
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex > 0) scrollToCat(categories[currentIndex - 1]);
    }
  };`;

// replace old touch logic
code = code.replace(/const \[touchStart[\s\S]*?};/m, newTouchLogic.trim());

// Update button onClick to also use scrollToCat
code = code.replace(
  'onClick={() => setActiveCategory(cat)}',
  'id={`cat_btn_${cat}`} onClick={() => scrollToCat(cat)}'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Swipe auto-scroll to category tab added.");
