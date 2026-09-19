import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. handleAddProductItem
code = code.replace(
  'const handleAddProductItem = p => setDoc(doc(db, \'products\', uid()), p);',
  `const handleAddProductItem = p => {
    const id = uid();
    setProducts(prev => [...prev, { id, ...p }]);
    setDoc(doc(db, 'products', id), p).catch(console.error);
  };`
);

// 2. handleEditProduct
code = code.replace(
  'const handleEditProduct = p => updateDoc(doc(db, \'products\', p.id), p);',
  `const handleEditProduct = p => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    updateDoc(doc(db, 'products', p.id), p).catch(console.error);
  };`
);

// 3. handleDeleteProduct
code = code.replace(
  'const handleDeleteProduct = id => deleteDoc(doc(db, \'products\', id));',
  `const handleDeleteProduct = id => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, 'products', id)).catch(console.error);
  };`
);

// 4. handleAddZone
code = code.replace(
  `  const handleAddZone = name => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    updateDoc(doc(db, 'settings', 'global'), { zones: [...zones, z] });
    // Yeni bölge için 8 masa oluştur
    for(let i=1; i<=8; i++) {
      setDoc(doc(db, 'tables', \`\${z}-\${i}\`), { name: \`Masa \${i}\`, zone: z, status: 'empty', orderId: null });
    }
  };`,
  `  const handleAddZone = name => {
    if (!name || zones.includes(name.toUpperCase())) return;
    const z = name.toUpperCase();
    
    // Optimistic
    setZones(prev => [...prev, z]);
    const newTables = Array.from({ length: 8 }, (_, i) => ({ id: \`\${z}-\${i+1}\`, name: \`Masa \${i+1}\`, zone: z, status: 'empty', orderId: null }));
    setTables(prev => [...prev, ...newTables]);
    
    // Firebase
    updateDoc(doc(db, 'settings', 'global'), { zones: [...zones, z] }).catch(console.error);
    newTables.forEach(t => setDoc(doc(db, 'tables', t.id), t).catch(console.error));
  };`
);

// 5. handleDeleteZone
code = code.replace(
  `  const handleDeleteZone = async z => {
    updateDoc(doc(db, 'settings', 'global'), { zones: zones.filter(x => x !== z) });
    // Bu bölgedeki masaları sil
    const q = query(collection(db, 'tables'), where('zone', '==', z));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => deleteDoc(doc(db, 'tables', docSnap.id)));
  };`,
  `  const handleDeleteZone = async z => {
    // Optimistic
    setZones(prev => prev.filter(x => x !== z));
    setTables(prev => prev.filter(t => t.zone !== z));
    
    // Firebase
    updateDoc(doc(db, 'settings', 'global'), { zones: zones.filter(x => x !== z) }).catch(console.error);
    const q = query(collection(db, 'tables'), where('zone', '==', z));
    getDocs(q).then(snapshot => {
      snapshot.forEach(docSnap => deleteDoc(doc(db, 'tables', docSnap.id)));
    }).catch(console.error);
  };`
);

// 6. handleAddCategory
code = code.replace(
  `  const handleAddCategory = name => { 
    if (name && !categories.includes(name.toUpperCase())) {
      updateDoc(doc(db, 'settings', 'global'), { categories: [...categories, name.toUpperCase()] });
    }
  };`,
  `  const handleAddCategory = name => { 
    if (name && !categories.includes(name.toUpperCase())) {
      const c = name.toUpperCase();
      setCategories(prev => [...prev, c]);
      updateDoc(doc(db, 'settings', 'global'), { categories: [...categories, c] }).catch(console.error);
    }
  };`
);

// 7. handleDeleteCategory
code = code.replace(
  `  const handleDeleteCategory = async cat => { 
    updateDoc(doc(db, 'settings', 'global'), { categories: categories.filter(c => c !== cat) });
    // Bu kategorideki ürünleri sil
    const q = query(collection(db, 'products'), where('category', '==', cat));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => deleteDoc(doc(db, 'products', docSnap.id)));
  };`,
  `  const handleDeleteCategory = async cat => { 
    // Optimistic
    setCategories(prev => prev.filter(c => c !== cat));
    setProducts(prev => prev.filter(p => p.category !== cat));
    
    // Firebase
    updateDoc(doc(db, 'settings', 'global'), { categories: categories.filter(c => c !== cat) }).catch(console.error);
    const q = query(collection(db, 'products'), where('category', '==', cat));
    getDocs(q).then(snapshot => {
      snapshot.forEach(docSnap => deleteDoc(doc(db, 'products', docSnap.id)));
    }).catch(console.error);
  };`
);

fs.writeFileSync('src/App.jsx', code);
