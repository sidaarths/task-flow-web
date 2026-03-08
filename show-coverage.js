const data = JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8'));
const files = Object.entries(data)
  .filter(([k]) => k !== 'total')
  .map(([k, v]) => ({ file: k.split('src').pop(), lines: v.lines.pct, functions: v.functions.pct }))
  .sort((a, b) => a.lines - b.lines);

console.log('LOW COVERAGE FILES (lines < 80%):');
files.filter(f => f.lines < 80).forEach(f => {
  console.log(f.lines + '%\t' + f.functions + '%fn\t' + f.file);
});
console.log('');
console.log('TOTAL:', data.total.lines.pct + '% lines', data.total.branches.pct + '% branches', data.total.functions.pct + '% functions');
