import jsPDF from 'jspdf';
import { SavedAnalysis } from '../types/analysis';

export function generateAnalysisPDF(analysis: SavedAnalysis) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 20;

  // Header Banner
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PACKWISE AI', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Intelligent Food Packaging Technical Assessment Report', margin, 21);

  const dateStr = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Date: ${dateStr}`, pageWidth - margin - 35, 21);

  y = 38;

  // Section 1: Food Commodity Summary
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`1. Commodity Profile: ${analysis.input.commodity}`, margin, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 24, 2, 2, 'F');
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category:', margin + 4, y);
  doc.text('Moisture Content:', margin + 45, y);
  doc.text('pH Level:', margin + 95, y);
  doc.text('Respiration:', margin + 135, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.input.category, margin + 4, y);
  doc.text(`${analysis.input.moisture}%`, margin + 45, y);
  doc.text(`${analysis.input.ph}`, margin + 95, y);
  doc.text(analysis.input.respiration || 'N/A', margin + 135, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Storage Profile:', margin + 4, y);
  doc.text('Shelf-Life Target:', margin + 45, y);
  doc.text('Sensitivities:', margin + 95, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${analysis.input.storageType} (${analysis.input.temperature}°C, ${analysis.input.humidity}% RH)`, margin + 4, y);
  doc.text(`${analysis.input.shelfLifeTarget} days`, margin + 45, y);
  const sensText = analysis.input.sensitivities.length ? analysis.input.sensitivities.join(', ') : 'Standard';
  doc.text(sensText.length > 45 ? sensText.slice(0, 42) + '...' : sensText, margin + 95, y);

  y += 14;

  // Section 2: Primary Recommendation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Primary Packaging Recommendation', margin, y);
  y += 6;

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 32, 2, 2, 'FD');
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text(analysis.result.materialName, margin + 5, y);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Prototype Compatibility Score: ${analysis.result.compatibility}%`, pageWidth - margin - 70, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Estimated Shelf Life Range: ${analysis.result.shelfLife.min} – ${analysis.result.shelfLife.max} Days`, margin + 5, y);
  doc.text(`Gas Composition (MAP): O₂ ${analysis.result.mapConditions.o2} · CO₂ ${analysis.result.mapConditions.co2} · N₂ ${analysis.result.mapConditions.n2}`, margin + 5, y + 5);
  doc.text(`Indicative Circularity LCA Score: ${analysis.result.sustainability.overall}% (${analysis.result.sustainability.note.slice(0, 75)}...)`, margin + 5, y + 10);

  y += 24;

  // Section 3: Technical Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Engineered Technical Specifications', margin, y);
  y += 6;

  const specs = analysis.result.specifications;
  const specItems = [
    ['Oxygen Permeation (OTR Target)', specs.otr],
    ['Water Vapor Barrier (WVTR Target)', specs.wvtr],
    ['Recommended Thickness Range', specs.thickness],
    ['Seal Integrity Requirement', specs.sealability],
    ['Puncture & Mechanical Strength', specs.mechanical],
    ['Modified Atmosphere Compatibility', specs.map],
  ];

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 38, 2, 2, 'F');
  y += 6;

  doc.setFontSize(9);
  specItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, margin + 90, y);
    y += 5.2;
  });

  y += 6;

  // Section 4: Why Recommended (Reasons)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Decision-Support Justification', margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  analysis.result.reasons.slice(0, 4).forEach((r) => {
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 3, y - 1, 1, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text(r, margin + 7, y);
    y += 5.5;
  });

  y += 6;

  // Section 5: Alternatives
  if (analysis.result.alternatives && analysis.result.alternatives.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('5. Evaluated Alternative Materials', margin, y);
    y += 5;

    analysis.result.alternatives.forEach((alt) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105);
      doc.text(`[${alt.focus}]`, margin + 3, y);
      doc.setTextColor(15, 23, 42);
      doc.text(`${alt.name} (${alt.compatibility}% Match) — ${alt.use}`, margin + 35, y);
      y += 4.5;
    });
  }

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  const disclaimer =
    'DISCLAIMER: PACKWISE AI is a decision-support prototype. Compatibility scores, shelf-life ranges, MAP gas compositions, and barrier targets are model estimates requiring formal food science laboratory validation.';
  doc.text(disclaimer, margin, 285, { maxWidth: pageWidth - 2 * margin });

  // Save the PDF
  const filename = `PACKWISE_Report_${analysis.input.commodity.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
