import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Replace the init variables with local storage reads
code = code.replace(
  'const [zones, setZones]           = useState(INIT_ZONES);',
  'const [zones, setZones]           = useState(() => JSON.parse(localStorage.getItem("zones")) || INIT_ZONES);'
);
code = code.replace(
  'const [categories, setCategories] = useState(INIT_CATEGORIES);',
  'const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem("categories")) || INIT_CATEGORIES);'
);
code = code.replace(
  'const [products, setProducts]     = useState(INIT_PRODUCTS);',
  'const [products, setProducts]     = useState(() => JSON.parse(localStorage.getItem("products")) || INIT_PRODUCTS);'
);
code = code.replace(
  'const [tables, setTables]         = useState(() => makeTables(INIT_ZONES));',
  'const [tables, setTables]         = useState(() => JSON.parse(localStorage.getItem("tables")) || makeTables(JSON.parse(localStorage.getItem("zones")) || INIT_ZONES));'
);
code = code.replace(
  'const [orders, setOrders]         = useState([]);',
  'const [orders, setOrders]         = useState(() => JSON.parse(localStorage.getItem("orders")) || []);'
);
code = code.replace(
  'const [sales, setSales]           = useState([]);',
  'const [sales, setSales]           = useState(() => JSON.parse(localStorage.getItem("sales")) || []);'
);

// Add useEffect to save to local storage
const localStorageSync = `
  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem("zones", JSON.stringify(zones));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("tables", JSON.stringify(tables));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [zones, categories, products, tables, orders, sales]);
`;

code = code.replace(
  'const [fbError, setFbError] = useState(\'\');',
  'const [fbError, setFbError] = useState(\'\');\n' + localStorageSync
);

fs.writeFileSync('src/App.jsx', code);
