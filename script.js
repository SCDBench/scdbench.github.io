(() => {
  'use strict';
  const data = window.SCDBENCH_RESULTS;
  const icons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 1.7 } });
  const readState = () => ({
    sample: document.querySelector('input[name="sample"]:checked').value,
    stratum: document.querySelector('input[name="stratum"]:checked').value,
    setting: document.querySelector('input[name="setting"]:checked').value
  });
  const formatValue = (value, column, contracts) => column === 2 ? value.toFixed(3) : column === 4 ? `${value} / ${contracts}` : `${value.toFixed(1)}%`;
  const settingLabel = setting => setting === 'initial' ? 'Zero-shot' : setting === 'repaired' ? 'Repaired' : 'Both settings';
  const selectedSettings = setting => setting === 'both' ? ['initial', 'repaired'] : [setting];

  function renderResults() {
    const { sample, stratum, setting } = readState();
    const currentSample = data.samples[sample];
    const current = currentSample.strata[stratum];
    const settings = selectedSettings(setting);
    const maxima = Object.fromEntries(settings.map(key => [key, current[key][0].map((_, i) => Math.max(...current[key].map(row => row[i])))]));
    const body = document.getElementById('results-body');
    body.replaceChildren(...data.models.flatMap((modelInfo, modelIndex) => settings.map((key, settingIndex) => {
      const values = current[key][modelIndex];
      const row = document.createElement('tr');
      row.classList.toggle('repaired-row', key === 'repaired');
      row.classList.toggle('model-start', modelIndex > 0 && settingIndex === 0);
      const model = document.createElement('th');
      model.scope = 'row';
      model.textContent = modelInfo.name;
      const condition = document.createElement('td');
      condition.textContent = settingLabel(key);
      row.append(model, condition);
      values.forEach((value, column) => {
        const cell = document.createElement('td');
        const content = document.createElement(value === maxima[key][column] ? 'strong' : 'span');
        content.textContent = formatValue(value, column, current.contracts);
        cell.append(content);
        row.append(cell);
      });
      return row;
    })));
    document.getElementById('sample-description').textContent = `${currentSample.label}: ${current.contracts} contracts and ${current.functions.toLocaleString('en-US')} public functions.`;
    document.getElementById('result-state').textContent = `${current.label} / ${settingLabel(setting)}`;
    document.getElementById('perfect-unit').textContent = `contracts / ${current.contracts}`;
    document.querySelector('.results-table caption').textContent = `${currentSample.label}, ${current.label}, ${settingLabel(setting)} model results.`;
    const highlightSetting = setting === 'initial' ? 'initial' : 'repaired';
    const highlightRows = current[highlightSetting];
    document.getElementById('highlights-caption').textContent = highlightSetting === 'initial' ? 'Best zero-shot results' : 'Best results after one-step repair';
    document.getElementById('result-highlights').replaceChildren(...[
      {label: 'Compilation', column: 1}, {label: 'ABI recovery', column: 2},
      {label: 'Semantic consistency', column: 3}, {label: 'Perfect recovery', column: 4}
    ].map(metric => {
      const value = Math.max(...highlightRows.map(row => row[metric.column]));
      const item = document.createElement('div');
      const label = document.createElement('dt');
      label.textContent = metric.label;
      const number = document.createElement('dd');
      number.textContent = formatValue(value, metric.column, current.contracts);
      const winners = document.createElement('span');
      winners.textContent = data.models.filter((_, i) => highlightRows[i][metric.column] === value).map(model => model.name).join(', ');
      number.append(winners);
      item.append(label, number);
      return item;
    }));
    const charts = document.getElementById('result-charts');
    charts.replaceChildren(...[
      { title: 'Compilation success', unit: `% of ${current.contracts} contracts`, column: 1 },
      { title: 'Semantic consistency', unit: `% of ${current.functions.toLocaleString('en-US')} public functions`, column: 3 }
    ].map(metric => {
      const panel = document.createElement('section');
      panel.className = 'chart-panel';
      const title = document.createElement('h3');
      title.textContent = metric.title;
      const unit = document.createElement('p');
      unit.className = 'chart-unit';
      unit.textContent = metric.unit;
      const bars = document.createElement('div');
      bars.className = 'bar-chart';
      data.models.forEach((model, i) => {
        const before = current.initial[i][metric.column];
        const after = current.repaired[i][metric.column];
        const bar = document.createElement('div');
        bar.className = 'bar-row';
        bar.style.setProperty('--model-color', model.color);
        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = model.short;
        const track = document.createElement('div');
        track.className = 'bar-track';
        track.setAttribute('aria-hidden', 'true');
        const line = document.createElement('div');
        line.className = 'gain-line';
        line.style.left = `${Math.min(before, after)}%`;
        line.style.width = `${Math.abs(after - before)}%`;
        track.append(line);
        [before, after].forEach((point, index) => {
          const dot = document.createElement('span');
          dot.className = `bar-dot${index ? ' after' : ''}`;
          dot.style.left = `${point}%`;
          track.append(dot);
        });
        const value = document.createElement('span');
        value.className = 'bar-values';
        value.setAttribute('aria-label', `Zero-shot ${before.toFixed(1)}%, repaired ${after.toFixed(1)}%`);
        const initialValue = document.createElement('span');
        initialValue.textContent = `${before.toFixed(1)}%`;
        const arrow = document.createElement('i');
        arrow.setAttribute('data-lucide', 'arrow-right');
        arrow.setAttribute('aria-hidden', 'true');
        const repairedValue = document.createElement('strong');
        repairedValue.textContent = `${after.toFixed(1)}%`;
        value.append(initialValue, arrow, repairedValue);
        bar.append(label, track, value);
        bars.append(bar);
      });
      const axis = document.createElement('div');
      axis.className = 'chart-axis';
      axis.setAttribute('aria-hidden', 'true');
      [0, 50, 100].forEach(value => {
        const tick = document.createElement('span');
        tick.textContent = `${value}%`;
        axis.append(tick);
      });
      panel.append(title, unit, bars, axis);
      return panel;
    }));
    icons();
  }

  document.querySelectorAll('.result-controls input').forEach(input => input.addEventListener('change', renderResults));
  document.getElementById('download-results').addEventListener('click', () => {
    const { sample, stratum, setting } = readState();
    const current = data.samples[sample].strata[stratum];
    const header = ['sample','stratum','setting','model','contracts','public_functions','format_pct','compilation_pct','abi_micro_f1','semantic_pct','perfect_contracts'];
    const rows = data.models.flatMap((model, i) => selectedSettings(setting).map(key => [sample, stratum, key, model.name, current.contracts, current.functions, ...current[key][i]]));
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n') + '\r\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `scdbench-${sample}-${stratum}-${setting}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.getElementById('copy-citation').addEventListener('click', async () => {
    const text = document.getElementById('bibtex').textContent;
    const status = document.getElementById('copy-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected for copying';
    }
    setTimeout(() => { status.textContent = ''; }, 3500);
  });

  document.querySelectorAll('a[href="#citation"]').forEach(link => link.addEventListener('click', () => {
    document.getElementById('citation').open = true;
  }));
  if (window.location?.hash === '#citation') document.getElementById('citation').open = true;

  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('nav a')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    navLinks.forEach(link => observer.observe(document.querySelector(link.getAttribute('href'))));
  }

  renderResults();
  icons();
})();
