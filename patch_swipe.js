import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// 1. Add touch states and handlers
const stateHooks = `  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '');
  
  // SWIPE LOGIC
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      // Swiped Left -> Next Category
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex < categories.length - 1) setActiveCategory(categories[currentIndex + 1]);
    } else if (distance < -50) {
      // Swiped Right -> Prev Category
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex > 0) setActiveCategory(categories[currentIndex - 1]);
    }
  };`;

code = code.replace("  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '');", stateHooks);

// 2. Attach handlers to the product grid wrapper
code = code.replace(
  '<div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24">',
  '<div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-3 md:p-5 pb-24" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>'
);

fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
console.log("Swipe logic added.");
