import fs from 'fs';
let code = fs.readFileSync('adisyon-app/src/App.jsx', 'utf8');

const tail = `
      <Sidebar view={view} setView={setView} />
      <div className="flex-1 overflow-hidden relative">
        {view === 'masalar' && <TablesView tables={tables} zones={zones} onTableClick={handleTableClick} onTableUpdate={t => mutate('update', 'tables', t.id, t)} onOrderCreate={o => { const mutations = [ { action: 'update', collection: 'tables', id: o.tableId, data: { status: 'occupied', orderId: o.id } }, { action: 'add', collection: 'orders', id: o.id, data: o } ]; invoke('mutate_db', { mutations }).then(fetchDb).catch(console.error); }} onTransfer={(tableId, toZone) => mutate('update', 'tables', tableId, { zone: toZone })} />}
        {view === 'urunler' && <ProductsAdmin products={products} categories={categories} colors={COLORS} onAdd={p => mutate('add', 'products', p.id, p)} onAddMultiple={items => { const mutations = items.map(p => ({ action: 'add', collection: 'products', id: p.id || Date.now().toString(36) + Math.random().toString(36).substring(2), data: p })); invoke('mutate_db', { mutations }).then(fetchDb).catch(console.error); }} onEdit={p => mutate('update', 'products', p.id, p)} onDelete={id => mutate('delete', 'products', id)} />}
        {view === 'ayarlar' && <SettingsAdmin settings={{ zones, categories }} onAddZone={handleAddZone} onDeleteZone={handleDeleteZone} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
        {view === 'ciro' && <CiroView sales={sales} />}
        {view === 'veresiye' && <VeresiyeView customers={veresiye} onAdd={c => mutate('add', 'veresiye', c.id, c)} onUpdate={c => mutate('update', 'veresiye', c.id, c)} />}
      </div>
      {!isOnline && (
        <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-50">
          <CloudOff size={20} /> Çevrimdışı (Hata)
        </div>
      )}
    </div>
  );
}
`;

code = code.trim() + '\n' + tail.trim() + '\n';
fs.writeFileSync('adisyon-app/src/App.jsx', code);
console.log("App tail fixed!");
