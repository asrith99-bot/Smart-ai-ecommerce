const axios = require('axios');
const fs = require('fs');

const BASE = 'http://localhost:5001';

const sortingOptions = ['recommended','rating','reviews','popular','value','price-asc','price-desc','newest'];

async function testSorts() {
  const results = [];
  for (const sort of sortingOptions) {
    try {
      const res = await axios.get(`${BASE}/api/products`, { params: { sort, limit: 50 } , timeout: 10000});
      const products = res.data.products || [];
      let pass = true;
      const details = [];

      if (products.length <= 1) {
        details.push('Not enough products to validate ordering');
      } else {
        if (sort === 'price-asc') {
          for (let i=1;i<products.length;i++){
            if (products[i].price < products[i-1].price) { pass = false; details.push(`price at ${i-1} > ${i}`); break; }
          }
        } else if (sort === 'price-desc') {
          for (let i=1;i<products.length;i++){
            if (products[i].price > products[i-1].price) { pass = false; details.push(`price at ${i-1} < ${i}`); break; }
          }
        } else if (sort === 'rating') {
          for (let i=1;i<products.length;i++){
            if (parseFloat(products[i].rating) > parseFloat(products[i-1].rating)) { pass = false; details.push(`rating order wrong at ${i-1} vs ${i}`); break; }
          }
        } else if (sort === 'reviews') {
          for (let i=1;i<products.length;i++){
            if ((products[i].reviewCount || 0) > (products[i-1].reviewCount || 0)) { pass = false; details.push(`reviews order wrong at ${i-1} vs ${i}`); break; }
          }
        } else if (sort === 'newest') {
          for (let i=1;i<products.length;i++){
            if (parseInt(products[i].id) > parseInt(products[i-1].id)) { pass = false; details.push(`newest order wrong at ${i-1} vs ${i}`); break; }
          }
        } else if (sort === 'recommended') {
          const score = p => (parseFloat(p.rating||0)*0.3) + (Math.log((p.reviewCount||0)+1)*0.4) + (((p.discount||0)/100)*0.3);
          for (let i=1;i<products.length;i++){
            if (score(products[i]) > score(products[i-1])) { pass = false; details.push(`recommended score order wrong at ${i-1} vs ${i}`); break; }
          }
        } else if (sort === 'popular') {
          const metric = p => ((p.reviewCount||0)*0.6 + parseFloat(p.rating||0)*0.4);
          for (let i=1;i<products.length;i++){
            if (metric(products[i]) > metric(products[i-1])) { pass = false; details.push(`popular metric order wrong at ${i-1} vs ${i}`); break; }
          }
        } else if (sort === 'value') {
          const value = p => (parseFloat(p.rating||0) + ((p.discount||0)/100) + Math.log((p.reviewCount||0)+1)) / 3;
          for (let i=1;i<products.length;i++){
            if (value(products[i]) > value(products[i-1])) { pass = false; details.push(`value order wrong at ${i-1} vs ${i}`); break; }
          }
        }
      }

      results.push({ sort, ok: pass, found: products.length, details: details.slice(0,5) });
    } catch (err) {
      results.push({ sort, ok: false, error: err.message });
    }
  }
  return results;
}

async function testNL() {
  const queries = [
    'laptop within 50000 with gaming and work',
    'phone under 20000 with good camera',
    't-shirt for gaming',
    'watch under 5000',
    'laptop 50000-70000 with rtx',
    'camera with 4k video under 100000'
  ];

  const results = [];
  for (const q of queries) {
    try {
      const res = await axios.get(`${BASE}/api/products`, { params: { search: q, limit: 10 }, timeout: 10000 });
      const parsed = (res.data && res.data.filterApplied && res.data.filterApplied.parsedNL) || null;
      const products = res.data.products || [];
      const topCat = products[0] ? (products[0].category || '').toLowerCase() : null;
      const preferred = parsed ? parsed.preferredCategory : null;
      const maxPrice = parsed ? parsed.maxPrice : null;

      const issues = [];
      if (preferred && products.length === 0) issues.push('preferredCategory parsed but no products returned');
      if (preferred && topCat && !topCat.includes(preferred)) issues.push(`top product category '${topCat}' does not include preferred '${preferred}'`);
      if (maxPrice && products.length>0) {
        // product.price is paise
        const anyOver = products.some(p => (p.price/100) > maxPrice);
        if (anyOver) issues.push(`some products exceed parsed maxPrice ${maxPrice}`);
      }

      results.push({ query: q, parsed, found: products.length, top: products.slice(0,3).map(p=>({id:p.id,title:p.title,category:p.category,price:p.price/100})), issues });
    } catch (err) {
      results.push({ query: q, error: err.message });
    }
  }
  return results;
}

(async () => {
  console.log('Running sorts tests...');
  const sortResults = await testSorts();
  console.log(JSON.stringify(sortResults, null, 2));

  console.log('\nRunning NL parser tests...');
  const nlResults = await testNL();
  console.log(JSON.stringify(nlResults, null, 2));

  const out = { sorts: sortResults, nl: nlResults, timestamp: new Date().toISOString() };
  fs.writeFileSync(__dirname + '/e2e_results.json', JSON.stringify(out, null, 2));

  // Generate a short markdown report for NL failures
  const failures = nlResults.filter(r => (r.issues && r.issues.length) || r.error);
  let md = `# NL Parser & E2E Test Report\n\nGenerated: ${out.timestamp}\n\n`;
  md += `## Sorts Summary\n\n`;
  sortResults.forEach(s => {
    md += `- **${s.sort}**: ${s.ok ? 'PASS' : 'FAIL'} (found ${s.found || 0})` + (s.details && s.details.length ? ` — ${s.details.join('; ')}` : '') + '\n';
  });

  md += '\n## NL Parser Failures\n\n';
  if (failures.length === 0) md += 'No NL parser failures detected.\n';
  else {
    for (const f of failures) {
      md += `### Query: ${f.query}\n`;
      if (f.error) md += `- Error: ${f.error}\n`;
      if (f.parsed) md += `- Parsed: ${JSON.stringify(f.parsed)}\n`;
      md += `- Found products: ${f.found || 0}\n`;
      if (f.top) md += `- Top products: ${JSON.stringify(f.top)}\n`;
      if (f.issues && f.issues.length) {
        md += `- Issues:\n`;
        f.issues.forEach(i => md += `  - ${i}\n`);
      }
      md += '\n';
    }

    md += '## Recommendations\n\n';
    md += '- Ensure numeric price parsing supports full numbers with commas (e.g., `50,000` → `50000`) and large values.\n';
    md += '- When `preferredCategory` is detected, include category-wide results even if keyword matches are weak.\n';
    md += '- Weight specKeywords strongly (e.g., `gaming` → GPU, RAM, discrete GPU entries).\n';
    md += '- Consider fuzzier matching for terms like "work" → map to battery, office, productivity specs.\n';
  }

  fs.writeFileSync(__dirname + '/nl_report.md', md);

  console.log('\nResults saved to:', __dirname + '/e2e_results.json');
  console.log('Report saved to:', __dirname + '/nl_report.md');
})();
