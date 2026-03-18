/* ============================================
   TACANNI — GTM ROI Calculator Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSliders();
});

function initSliders() {
  const sliders = [
    { id: 'revenue', displayId: 'revenueDisplay', format: 'currency' },
    { id: 'growth', displayId: 'growthDisplay', format: 'percent' },
    { id: 'reps', displayId: 'repsDisplay', format: 'number' },
    { id: 'deal', displayId: 'dealDisplay', format: 'currency' },
    { id: 'cycle', displayId: 'cycleDisplay', format: 'days' }
  ];

  sliders.forEach(({ id, displayId, format }) => {
    const slider = document.getElementById(id);
    const display = document.getElementById(displayId);

    if (!slider || !display) return;

    // Style the slider track
    updateSliderTrack(slider);

    slider.addEventListener('input', () => {
      display.textContent = formatValue(slider.value, format);
      updateSliderTrack(slider);
    });
  });
}

function updateSliderTrack(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const percent = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--gold) 0%, var(--gold) ${percent}%, var(--bg-elevated) ${percent}%, var(--bg-elevated) 100%)`;
}

function formatValue(value, format) {
  const num = parseFloat(value);
  switch (format) {
    case 'currency':
      if (num >= 1000000) {
        return '$' + (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
      }
      return '$' + num.toLocaleString();
    case 'percent':
      return num + '%';
    case 'days':
      return num + ' days';
    case 'number':
    default:
      return num.toLocaleString();
  }
}

function calculateROI() {
  const revenue = parseFloat(document.getElementById('revenue').value);
  const growth = parseFloat(document.getElementById('growth').value) / 100;
  const reps = parseFloat(document.getElementById('reps').value);
  const deal = parseFloat(document.getElementById('deal').value);
  const cycle = parseFloat(document.getElementById('cycle').value);

  /* Conservative assumptions for a GTM engagement:
     - Win rate improvement:         15-25% → use 18%
     - Sales cycle reduction:        10-20% → use 15%
     - Ramp time reduction:          20-30% → use 20%
     - Incremental growth rate lift: 5-15pp → use 8pp
  */
  const winRateImprovement = 0.18;
  const cycleReduction = 0.15;
  const additionalGrowthPct = 0.08;

  // Deals per rep per year (current)
  const currentDealsPerRepPerYear = (365 / cycle);
  const improvedDealsPerRepPerYear = (365 / (cycle * (1 - cycleReduction)));

  // Revenue gain from faster cycles
  const additionalDealsFromSpeed = (improvedDealsPerRepPerYear - currentDealsPerRepPerYear) * reps;
  const revenueFromSpeed = additionalDealsFromSpeed * deal;

  // Revenue gain from higher win rates (applied to existing pipeline)
  const currentDealsTotal = currentDealsPerRepPerYear * reps;
  const revenueFromWinRate = currentDealsTotal * winRateImprovement * deal * 0.5; // 50% to be conservative — not all pipeline benefits equally

  // Revenue gain from incremental growth strategy improvement
  const revenueFromGrowthLift = revenue * additionalGrowthPct;

  // Total projected lift
  const totalLift = revenueFromSpeed + revenueFromWinRate + revenueFromGrowthLift;

  // ROI (assuming engagement cost of ~$120K–$180K for fractional CRO)
  const engagementCost = Math.min(Math.max(revenue * 0.02, 60000), 180000);
  const roiMultiple = totalLift / engagementCost;

  // Payback period (months)
  const monthlyLift = totalLift / 12;
  const paybackMonths = Math.ceil(engagementCost / monthlyLift);

  // Show results with animation
  const resultsEl = document.getElementById('calcResults');
  resultsEl.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animate numbers
  animateValue('resultLift', totalLift, 'currency');
  animateValue('resultROI', roiMultiple, 'multiple');
  animateValue('resultPayback', paybackMonths, 'months');
}

function animateValue(elementId, target, format) {
  const el = document.getElementById(elementId);
  const duration = 1200;
  const steps = 40;
  const stepDuration = duration / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += target / steps;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    switch (format) {
      case 'currency':
        if (current >= 1000000) {
          el.textContent = '$' + (current / 1000000).toFixed(1) + 'M';
        } else {
          el.textContent = '$' + Math.round(current).toLocaleString();
        }
        break;
      case 'multiple':
        el.textContent = current.toFixed(1) + 'x';
        break;
      case 'months':
        el.textContent = Math.round(current) + (Math.round(current) === 1 ? ' month' : ' months');
        break;
    }
  }, stepDuration);
}
