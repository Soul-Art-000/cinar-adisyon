import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

const correctReturn = `  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 relative">
      <Sidebar view={view} setView={setView} />
      {view === 'masalar' && <TablesView tables={tables} zones={zones} onTableClick={handleTableClick} />}
      {view === 'urunler' && <ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={handleAddProductItem} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />}
      {view === 'ciro'    && <CiroView sales={sales} />}
      {view === 'ayarlar' && <SettingsAdmin zones={zones} categories={categories} onAddZone={handleAddZone} onDeleteZone={handleDeleteZone} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
    </div>
  );
}`;

// Replace the bad return with the correct one
code = code.replace(/  return \(\n    <div className="flex h-screen overflow-hidden bg-gray-100 relative">[\s\S]*\}\n/m, correctReturn + '\n');
fs.writeFileSync('src/App.jsx', code);
