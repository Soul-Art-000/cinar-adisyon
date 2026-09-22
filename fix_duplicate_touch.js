import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/components/OrderView.jsx', 'utf8');

// Find the start of the old leftover block
const oldBlockStart = "  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);\n  const onTouchEnd = () => {\n    if (!touchStart || !touchEnd) return;\n    const distance = touchStart - touchEnd;\n    if (distance > 50) {\n      // Swiped Left -> Next Category\n      const currentIndex = categories.indexOf(activeCategory);\n      if (currentIndex < categories.length - 1) setActiveCategory(categories[currentIndex + 1]);\n    } else if (distance < -50) {\n      // Swiped Right -> Prev Category\n      const currentIndex = categories.indexOf(activeCategory);\n      if (currentIndex > 0) setActiveCategory(categories[currentIndex - 1]);\n    }\n  };";

if (code.includes(oldBlockStart)) {
  code = code.replace(oldBlockStart, "");
  fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
  console.log("Fixed duplicate touch event functions.");
} else {
  console.log("Could not find exact duplicate block. Attempting fallback replace.");
  // Fallback: use substring
  let parts = code.split('  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);');
  if (parts.length === 3) {
    // 0 is before first, 1 is between first and second, 2 is after second
    // We want to keep the first one (parts[0] + first + parts[1]) and remove the second.
    // Actually, wait, parts[2] starts with the inside of the SECOND onTouchMove
    // Let's just fix it using a simpler regex.
    code = code.replace(/  const onTouchMove = \(e\).*?Swiped Right.*?\}\n  \};\n/s, '');
    fs.writeFileSync('adisyon-app/src/components/OrderView.jsx', code);
    console.log("Fixed via fallback regex.");
  }
}
